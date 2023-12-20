import PayPalService from '~/src/Services/PayPalService';
import Payment from '~/src/Models/DBModels/Payment';
import Subscription from '~/src/Models/DBModels/Subscription';
import Plan from '~/src/Models/DBModels/Plan';
import User from '~/src/Models/DBModels/User';
import SendGrid from '~/src/Models/SendGrid';
import BillingIntervalHelper from '~/src/Models/BillingIntervalHelper';
import { SubscriptionSource } from '~/src/enums';
import ApiHandler from '~/src/Services/ApiHandler';
import paypal from 'paypal-node-sdk';


export default ApiHandler(false, async (req, res) => {
    const config = PayPalService.config();
    paypal.configure({
        'mode': config.MODE,
        'client_id': config.PAYPAL_CLIENT,
        'client_secret': config.PAYPAL_SECRET
    });

    const isVerified = await PayPalService.verifyWebhook(req, config.WEBHOOK_ID);
    if (!isVerified) throw new Error("Could not verify PayPal webhook");

    const body = req.body;
    const event = body.event_type;
    console.log(event);
    switch (event) {
        case 'BILLING.SUBSCRIPTION.CREATED':
            // Creates an entry in our database
            await _handleSubscriptionCreated(body);
            break;
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
            // (If needed) Creates an entry in our database
            // Links the user to the subscription
            await _handleSubscriptionActivated(body);
            break;
        case 'BILLING.SUBSCRIPTION.CANCELLED':
            await _handleSubscriptionCancelled(body);
            break;
        case 'PAYMENT.SALE.COMPLETED':
            // For subscription: Updates current period end
            await _handleSubscriptionPaymentCompleted(body);
            break;
        case 'PAYMENT.SALE.REFUNDED':
            // For subscription: Update amount when refunded
            await _handleSubscriptionPaymentRefunded(body);
            break;
        case 'BILLING.SUBSCRIPTION.UPDATED':
        case 'BILLING.SUBSCRIPTION.EXPIRED':
        case 'BILLING.SUBSCRIPTION.SUSPENDED':
            await _handleSubscriptionUpdated(body);
            break;
        default:
        // Unhandled event type
    }

    res.status(200).json({ received: true });
});

async function findPlan(paypalPlanID) {
    let planSearch;
    if (process.env.USE_PAYPAL_TEST == "1") {
        planSearch = { testPayPalPlanID: paypalPlanID };
    } else {
        planSearch = { paypalPlanID: paypalPlanID };
    }
    return Plan.findOne({ where: planSearch });
}

async function _handleSubscriptionPaymentRefunded(body) {
    console.log(`=== Payment Refunded (Subscription) ===`);

    const refundedAmount = body.resource.amount.total;
    const transactionID = body.resource.sale_id;

    const payment = await Payment.findOne({ where: { sourceID: transactionID } });
    const newAmount = Number(payment.amount) - Number(refundedAmount);

    if (newAmount <= 0) {
        await Payment.delete({where: {sourceID: transactionID}});
    } else {
        const query = `UPDATE ${Payment.tableName()} SET amount = ? WHERE sourceID = ?`;
        await Payment.query(query, [newAmount, transactionID]);
    }
}

/*
  1. Update current period end
  2. Adds payment record to database
*/
async function _handleSubscriptionPaymentCompleted(body) {
    // Hack: Sometimes payment.completed gets called before subscription.create, so wait to make sure its created.
    await sleep(1000);
    console.log(`=== Payment Completed (Subscription) ===`);

    const subscriptionID = body.resource.billing_agreement_id;
    const userID = body.resource.custom;
    const amount = body.resource.amount.total;
    const transactionID = body.resource.id;

    const paypalSubscription = await PayPalService.getSubscription(subscriptionID);

    await Payment.create({ amount, userID, source: SubscriptionSource.PayPal, sourceID: transactionID});
    await syncPayPalSubscriptionToDB(paypalSubscription);
    await Subscription.renew(subscriptionID);

    console.log(` > ${subscriptionID}`);
}

/*
  1. Adds a subscription row to database. Not activated until BILLING.SUBSCRIPTION.ACTIVATED
*/
async function _handleSubscriptionCreated(body) {
    console.log(`=== Subscription Created ===`);

    const subscriptionID = body.resource.id;
    const userID = body.resource.custom_id;
    const status = Subscription.normalizeStatus(body.resource.status);
    const paypalPlanID = body.resource.plan_id;
    const plan = await findPlan(paypalPlanID);

    await Subscription.create({
        subscriptionID: subscriptionID,
        userID: userID,
        status: status,
        billingInterval: BillingIntervalHelper.fromPlanModelInterval(plan.billingInterval),
        planID: plan.id,
        source: SubscriptionSource.PayPal
    });
    console.log(` > created: ${subscriptionID}`);
}

/*
  1. Simply keeps our records in sync with PayPal
*/
async function _handleSubscriptionUpdated(body) {
    console.log(`=== Subscription Updated ===`);
    await syncPayPalSubscriptionToDB(body.resource);
}

async function syncPayPalSubscriptionToDB(subscription) {
    const subscriptionID = subscription.id;
    const status = Subscription.normalizeStatus(subscription.status);
    const amount = subscription.billing_info.last_payment.amount.value;
    //  Sometimes we get the payment.sale.completed event twice (maybe due to hold status?) and it can be way after the subscription is cancelled.
    // In this case the next_billing_time doesn't exist, so ignore this event.
    if (!subscription.billing_info.next_billing_time) return;
    const currentPeriodEnd = toSqlDatetime(subscription.billing_info.next_billing_time);

    await Subscription.update({
        amount: amount,
        currentPeriodEnd: currentPeriodEnd,
        status: status,
    }, subscriptionID);
}

/*
  1. Creates the subscription record, if needed.
  2. Sets the subscription ID to be the user's current subscription.
  3. Cancels their old subscription, if they had one.
  4. Sends us a notification.
  5. Updates the subscription stats so the user can use their new subscription.
*/
async function _handleSubscriptionActivated(body) {
    console.log(`=== Subscription Activated ===`);
    const subscriptionID = body.resource.id;

    // Manually call subscription create if somehow this event gets called out of order.
    const matchingSubscription = await Subscription.findOne({ where: { id: subscriptionID } });
    if (!matchingSubscription) {
        await _handleSubscriptionCreated(body);
    }

    const status = Subscription.normalizeStatus(body.resource.status);
    const paypalPlanID = body.resource.plan_id;
    const userID = body.resource.custom_id;
    const amount = body.resource.billing_info.last_payment.amount.value;
    const currentPeriodEnd = toSqlDatetime(body.resource.billing_info.next_billing_time);
    const plan = await findPlan(paypalPlanID);

    // Get reference to the user's old subscription
    const oldSubscription = await User.getSubscription(userID);

    // Link user to the new subscription
    await User.update({ subscriptionID: subscriptionID }, userID);
    console.log(` > linked user ${userID} to subscription: ${subscriptionID}`);

    // Cancel and terminate the old subscription, immediately
    if (oldSubscription && oldSubscription.canCancel() && oldSubscription.id != subscriptionID) {
        console.log(` > canceling old subscription: ${oldSubscription.id}`);
        await oldSubscription.cancel({ atStripePeriodEnd: false });
        // Since PayPal handles cancelation/termination differently like Stripe, we manually mark it terminated here.
        const query = `UPDATE ${Subscription.tableName()} SET dateTerminated = NOW() WHERE id = ?`;
        await Subscription.query(query, [oldSubscription.id])
    }

    // Notify us
    if (amount > 30) {
      await SendGrid.devNotification({ name: `Purchase (PayPal) | ${amount}`, accountEmail: userID }).send();
    }

    await Subscription.update({ amount: amount, currentPeriodEnd: currentPeriodEnd, status: status }, subscriptionID);
    await Subscription.renew(subscriptionID);

    console.log(` > activated subscription ${subscriptionID}`);
}

async function _handleSubscriptionCancelled(body) {
    console.log(`=== Subscription Cancelled ===`);
    const subscriptionID = body.resource.id;
    const status = Subscription.normalizeStatus(body.resource.status);
    const query = `UPDATE ${Subscription.tableName()} SET dateCanceled = NOW(), status = ? WHERE id = ?`;
    await Subscription.query(query, [status, subscriptionID]);
    console.log(` > setting subscription status to canceled: ${subscriptionID}`);
}

const toSqlDatetime = (inputDate, hoursAdded = 4) => new Date(new Date(inputDate).getTime() + 1000 * 60 * 60 * hoursAdded).toISOString().slice(0, 19).replace('T', ' ');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/*
{
  "id": "WH-34X36469WX676933R-2P1266859B770040P",
  "event_version": "1.0",
  "create_time": "2022-06-24T19:59:04.920Z",
  "resource_type": "subscription",
  "resource_version": "2.0",
  "event_type": "BILLING.SUBSCRIPTION.CANCELLED",
  "summary": "Subscription cancelled",
  "resource": {
    "quantity": "1",
    "subscriber": {
      "email_address": "sb-5z4c4317507113@personal.example.com",
      "payer_id": "9B84P2Q6BE4BN",
      "name": {
        "given_name": "John",
        "surname": "Doe"
      },
      "shipping_address": {
        "address": {
          "address_line_1": "1 Main St",
          "admin_area_2": "San Jose",
          "admin_area_1": "CA",
          "postal_code": "95131",
          "country_code": "US"
        }
      }
    },
    "create_time": "2022-06-24T19:41:57Z",
    "plan_overridden": false,
    "shipping_amount": {
      "currency_code": "USD",
      "value": "0.0"
    },
    "start_time": "2022-06-24T19:41:38Z",
    "update_time": "2022-06-24T19:58:36Z",
    "billing_info": {
      "outstanding_balance": {
        "currency_code": "USD",
        "value": "0.0"
      },
      "cycle_executions": [
        {
          "tenure_type": "REGULAR",
          "sequence": 1,
          "cycles_completed": 1,
          "cycles_remaining": 0,
          "current_pricing_scheme_version": 1,
          "total_cycles": 0
        }
      ],
      "last_payment": {
        "amount": {
          "currency_code": "USD",
          "value": "5.0"
        },
        "time": "2022-06-24T19:41:58Z"
      },
      "failed_payments_count": 0
    },
    "links": [
      {
        "href": "https://api.sandbox.paypal.com/v1/billing/subscriptions/I-1E2LTB0J1YGW",
        "rel": "self",
        "method": "GET",
        "encType": "application/json"
      }
    ],
    "id": "I-1E2LTB0J1YGW",
    "plan_id": "P-53G711603K123334JMK2NVKI",
    "status": "CANCELLED",
    "status_update_time": "2022-06-24T19:58:36Z"
  },
  "links": [
    {
      "href": "https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-34X36469WX676933R-2P1266859B770040P",
      "rel": "self",
      "method": "GET"
    },
    {
      "href": "https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-34X36469WX676933R-2P1266859B770040P/resend",
      "rel": "resend",
      "method": "POST"
    }
  ]
}
*/

/*
{
  "id": "WH-7G846752KK2657835-4U227498DH403934E",
  "event_version": "1.0",
  "create_time": "2022-06-24T19:41:39.084Z",
  "resource_type": "subscription",
  "resource_version": "2.0",
  "event_type": "BILLING.SUBSCRIPTION.CREATED",
  "summary": "Subscription created",
  "resource": {
    "start_time": "2022-06-24T19:41:38Z",
    "quantity": "1",
    "create_time": "2022-06-24T19:41:38Z",
    "links": [
      {
        "href": "https://www.sandbox.paypal.com/webapps/billing/subscriptions?ba_token=BA-9BT474281C717751V",
        "rel": "approve",
        "method": "GET"
      },
      {
        "href": "https://api.sandbox.paypal.com/v1/billing/subscriptions/I-1E2LTB0J1YGW",
        "rel": "edit",
        "method": "PATCH"
      },
      {
        "href": "https://api.sandbox.paypal.com/v1/billing/subscriptions/I-1E2LTB0J1YGW",
        "rel": "self",
        "method": "GET"
      }
    ],
    "id": "I-1E2LTB0J1YGW",
    "plan_overridden": false,
    "plan_id": "P-53G711603K123334JMK2NVKI",
    "status": "APPROVAL_PENDING"
  },
  "links": [
    {
      "href": "https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-7G846752KK2657835-4U227498DH403934E",
      "rel": "self",
      "method": "GET"
    },
    {
      "href": "https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-7G846752KK2657835-4U227498DH403934E/resend",
      "rel": "resend",
      "method": "POST"
    }
  ]
}
*/

/*
{
  "id": "WH-4GV89724R21962040-1C819962UB8804029",
  "event_version": "1.0",
  "create_time": "2022-06-24T19:42:05.458Z",
  "resource_type": "subscription",
  "resource_version": "2.0",
  "event_type": "BILLING.SUBSCRIPTION.ACTIVATED",
  "summary": "Subscription activated",
  "resource": {
    "quantity": "1",
    "subscriber": {
      "email_address": "sb-5z4c4317507113@personal.example.com",
      "payer_id": "9B84P2Q6BE4BN",
      "name": {
        "given_name": "John",
        "surname": "Doe"
      },
      "shipping_address": {
        "address": {
          "address_line_1": "1 Main St",
          "admin_area_2": "San Jose",
          "admin_area_1": "CA",
          "postal_code": "95131",
          "country_code": "US"
        }
      }
    },
    "create_time": "2022-06-24T19:41:57Z",
    "plan_overridden": false,
    "shipping_amount": {
      "currency_code": "USD",
      "value": "0.0"
    },
    "start_time": "2022-06-24T19:41:38Z",
    "update_time": "2022-06-24T19:41:58Z",
    "billing_info": {
      "outstanding_balance": {
        "currency_code": "USD",
        "value": "0.0"
      },
      "cycle_executions": [
        {
          "tenure_type": "REGULAR",
          "sequence": 1,
          "cycles_completed": 1,
          "cycles_remaining": 0,
          "current_pricing_scheme_version": 1,
          "total_cycles": 0
        }
      ],
      "last_payment": {
        "amount": {
          "currency_code": "USD",
          "value": "5.0"
        },
        "time": "2022-06-24T19:41:58Z"
      },
      "next_billing_time": "2022-07-24T10:00:00Z",
      "failed_payments_count": 0
    },
    "links": [
      {
        "href": "https://api.sandbox.paypal.com/v1/billing/subscriptions/I-1E2LTB0J1YGW/cancel",
        "rel": "cancel",
        "method": "POST",
        "encType": "application/json"
      },
      {
        "href": "https://api.sandbox.paypal.com/v1/billing/subscriptions/I-1E2LTB0J1YGW",
        "rel": "edit",
        "method": "PATCH",
        "encType": "application/json"
      },
      {
        "href": "https://api.sandbox.paypal.com/v1/billing/subscriptions/I-1E2LTB0J1YGW",
        "rel": "self",
        "method": "GET",
        "encType": "application/json"
      },
      {
        "href": "https://api.sandbox.paypal.com/v1/billing/subscriptions/I-1E2LTB0J1YGW/suspend",
        "rel": "suspend",
        "method": "POST",
        "encType": "application/json"
      },
      {
        "href": "https://api.sandbox.paypal.com/v1/billing/subscriptions/I-1E2LTB0J1YGW/capture",
        "rel": "capture",
        "method": "POST",
        "encType": "application/json"
      }
    ],
    "id": "I-1E2LTB0J1YGW",
    "plan_id": "P-53G711603K123334JMK2NVKI",
    "status": "ACTIVE",
    "status_update_time": "2022-06-24T19:41:58Z"
  },
  "links": [
    {
      "href": "https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-4GV89724R21962040-1C819962UB8804029",
      "rel": "self",
      "method": "GET"
    },
    {
      "href": "https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-4GV89724R21962040-1C819962UB8804029/resend",
      "rel": "resend",
      "method": "POST"
    }
  ]
}
*/

/*

====================

{
  "id": "WH-00193370VD118004H-9MC03700AR6141431",
  "event_version": "1.0",
  "create_time": "2022-06-24T20:50:12.909Z",
  "resource_type": "sale",
  "event_type": "PAYMENT.SALE.COMPLETED",
  "summary": "Payment completed for $ 5.0 USD",
  "resource": {
    "amount": {
      "total": "5.00",
      "currency": "USD",
      "details": {
        "subtotal": "5.00"
      }
    },
    "payment_mode": "INSTANT_TRANSFER",
    "create_time": "2022-06-24T20:49:41Z",
    "custom": "17",
    "transaction_fee": {
      "currency": "USD",
      "value": "0.66"
    },
    "billing_agreement_id": "I-E8W6NNUG630J",
    "update_time": "2022-06-24T20:49:41Z",
    "protection_eligibility_type": "ITEM_NOT_RECEIVED_ELIGIBLE,UNAUTHORIZED_PAYMENT_ELIGIBLE",
    "protection_eligibility": "ELIGIBLE",
    "links": [
      {
        "method": "GET",
        "rel": "self",
        "href": "https://api.sandbox.paypal.com/v1/payments/sale/6GR1339578830245H"
      },
      {
        "method": "POST",
        "rel": "refund",
        "href": "https://api.sandbox.paypal.com/v1/payments/sale/6GR1339578830245H/refund"
      }
    ],
    "id": "6GR1339578830245H",
    "state": "completed",
    "invoice_number": ""
  },
  "links": [
    {
      "href": "https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-00193370VD118004H-9MC03700AR6141431",
      "rel": "self",
      "method": "GET"
    },
    {
      "href": "https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-00193370VD118004H-9MC03700AR6141431/resend",
      "rel": "resend",
      "method": "POST"
    }
  ]
}
*/