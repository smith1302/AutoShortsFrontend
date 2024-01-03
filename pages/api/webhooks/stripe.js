import { STRIPE_SECRET, WEBHOOK_KEY } from '~/src/StripeConfig';
const stripe = require('stripe')(STRIPE_SECRET);
import getRawBody from "raw-body";
import { RefillPaymentSource, SubscriptionSource } from '~/src/enums';
import Payment from '~/src/Models/DBModels/Payment';
import Plan from '~/src/Models/DBModels/Plan';
import Subscription from '~/src/Models/DBModels/Subscription';
import User from '~/src/Models/DBModels/User';
import SendGrid from '~/src/Models/SendGrid';
import BillingIntervalHelper from '~/src/Models/BillingIntervalHelper';
import ApiHandler from '~/src/Services/ApiHandler';
import VideoScheduler from '~/src/Models/VideoScheduler';
import StripeService from 'src/Services/StripeService';

// Required for every webhook since the request needs to include the raw body
// This also means you can not use req.body and should only use the result of the 
// webhook validation
export const config = {
    api: {
        bodyParser: false,
    },
}

/*

Subscription flow
    --> Subscription created
        - Add to subscription row to DB, link to user row
    --> Subscription updated
        - Updates status, current period end, etc.
    --> Invoice paid
        - Logs payment in DB

    The subscription won't be "usable" by the user until:
        - it's invoice has been paid
        - the subscription has updated to become active and the current period end is past today
*/

export default ApiHandler(false, async (req, res) => {
    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'];
    const endpointSecret = WEBHOOK_KEY; // https://dashboard.stripe.com/test/webhooks/we_1HKAXrL4Am63My76iOWGiNU1
    const event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    switch (event.type) {
        case 'customer.subscription.created':
            // Subscription created, but not yet paid.
            await _handleSubscriptionCreated(event);
            break;
        case 'customer.subscription.updated':
            // Subscription status has changed.
            await _handleSubscriptionUpdated(event);
            break;
        case 'customer.subscription.deleted':
            // Occurs whenever a subscription ends.
            await _handleSubscriptionDeleted(event);
            break;
        case 'invoice.paid':
            // Sent each billing interval when a payment succeeds.
            await _handleInvoicePaid(event);
            break;
        case 'invoice.updated':
            // Sent each billing interval when a payment succeeds.
            await _handleInvoiceUpdated(event);
            break;
        case 'invoice.payment_failed':
            await _handleInvoiceFailed(event);
            break;
        case 'charge.refunded':
            await _handleChargeRefunded(event);
            break;
        default:
            // Unhandled event type
    }

    return res.status(200).json({received: true});
});

async function _handleChargeRefunded(event) {
    try {
        const charge = event.data.object;
        const invoiceID = charge.invoice;
        const fullyRefunded = charge.refunded;
        const newAmountCents = charge.amount - charge.amount_refunded;
        const newAmount = (newAmountCents / 100).toFixed(2);
        // Delete from DB if fully refunded, otherwise update the amount
        if (fullyRefunded || newAmount <= 0) {
            await Payment.delete({where: {sourceID: invoiceID}});
        } else {
            const query = `UPDATE ${Payment.tableName()} SET amount = ? WHERE sourceID = ?`;
            await Payment.query(query, [newAmount, invoiceID]);
        }
    } catch (err) {
        console.log("(!) Charge.refunded webhook failed");
    }
}

async function _handleInvoiceFailed(event) {
    // Even if payment fails, save the stripe customer ID to the user so we have it for future attempts.
    try {
        const invoice = event.data.object;
        const stripeCustomerID = invoice.customer;
        // Check if user already has a stripe customer ID
        const existingUser = await User.findOne({where: {stripeCustomerID: stripeCustomerID}});
        // If not, save it to the user
        if (!existingUser) {
            const userID = invoice.lines.data[0].metadata.clientUserID;
            await User.update({stripeCustomerID: stripeCustomerID}, userID);
        }
    } catch (err) {

    }
}

/* This is just so we can update the billing anchor. Important to do this here so we arent caught in an infinite loop */
async function _handleInvoiceUpdated(event) {
    const invoice = event.data.object;
    const subscriptionID = invoice.subscription;
    const attemptCount = invoice.attempt_count;
    const status = invoice.status;
    // Verify that this is for a failed subscription payment that has just succeeded.
    if (!subscriptionID || attemptCount <= 1 || status != "paid") return;

    const created = invoice.created;
    const minutesSinceCreated = (Date.now() - created * 1000) / 1000 / 60;
    // Since we are only interested in past due payments, we only want to consider invoices that have been paid some time after they were created.
    // This eliminates considering subscription created payments since they are paid immediately.
    if (minutesSinceCreated < 5) return;

    // Always move the billing start date to the time the invoice is paid.
    // This is not necessary in most cases, but its useful for when a failed payment succeeds.
    // For example: A user subscribes on Oct 1st, then on Nov 1st their payment fails. It finall succeeds on Nov 29th. We want the new
    // Billing date to be on the 29th, not the 1st.
    // The only way to do this without incuring an immediate charge is to move the billing anchor by using a "free trial".
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    const oneMonthFromNowUnix = Math.floor(oneMonthFromNow.getTime() / 1000);
    await stripe.subscriptions.update(subscriptionID, {
        trial_end: oneMonthFromNowUnix,
        proration_behavior: 'none',
    });
}

/*
    - Links user to subscription now that is paid.
    - Cancel any previous subscription in the case of an upgrade.
*/
async function _handleInvoicePaid(event) {
    const invoice = event.data.object;
    const subscriptionID = invoice.subscription;
    if (!subscriptionID) {
        return;
    }

    const invoiceID = invoice.id;
    const amount = (invoice.amount_paid / 100).toFixed(2);
    const billingReason = invoice.billing_reason;
    const stripeCustomerID = invoice.customer;
    const metadata = invoice.lines.data[0].metadata;
    const subscription = await Subscription.findOne({where: {id: subscriptionID}});
    // In race condition, subscription will not have been created in the DB yet from subscription.created, so fallback to metadata.
    const userID = subscription ? subscription.userID : metadata.clientUserID;

    if (billingReason == "subscription_create") {
        // Get reference to the user's old subscription
        const oldSubscription = await User.getSubscription(userID);
        // Link user to the new subscription
        await User.update({
            subscriptionID: subscriptionID, 
            stripeCustomerID: stripeCustomerID
        }, userID);
        // Cancel the old subscription immediately
        if (oldSubscription && oldSubscription.canCancel() && oldSubscription.id != subscriptionID) {
            console.log(`> Canceling old subscription: ${oldSubscription.id}`);
            await oldSubscription.cancel({atStripePeriodEnd: false});
        }

        // If plan's changed, we also need to update any existing video's posting schedule.
        const videoScheduler = new VideoScheduler();
        await videoScheduler.updateScheduledVideosForUser({userID: userID});

        // Notify us
        // if (amount > 30) {
            await SendGrid.devNotification({name: `Purchase | ${amount}`, accountEmail: userID}).send();
        // }
    }

    // Amount would only be 0 when we change the billing anchor which created a new invoice (very annoying).
    if (amount > 0) {
        await Payment.create({ amount, userID, source: SubscriptionSource.Stripe, sourceID: invoiceID });
    }
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionID);
    await StripeService.syncStripeSubscriptionToDB(stripeSubscription);
    await Subscription.renew(subscriptionID);
}

async function _handleSubscriptionCreated(event) {
    const subscription = event.data.object;
    const price = subscription.items.data[0].price;
    const billingInterval = BillingIntervalHelper.fromStripeInterval(price.recurring.interval);
    const userID = subscription.metadata.clientUserID;
    const planID = subscription.metadata.clientPlanID;
    const plan = await Plan.findOne({where: {id: planID}});
    const subscriptionID = subscription.id;
    const stripeCustomerID = subscription.customer;
    const status = subscription.status;
    const coupon = subscription.discount?.coupon;
    let amount = (price.unit_amount / 100).toFixed(2);
    if (coupon && coupon.percent_off && coupon.valid) {
        amount = amount * (100 - coupon.percent_off) / 100;
    }

    console.log(`> Subscription created: ${subscriptionID} with status ${status}`);

    await Subscription.create({
        subscriptionID: subscriptionID, 
        userID: userID, 
        amount: amount, 
        status: status,
        billingInterval: billingInterval,
        planID: planID,
    });
}

async function _handleSubscriptionUpdated(event) {
    // Hack: Sometimes subscription.updated gets called before subscription.create, so wait to make sure its created.
    await sleep(3000);
    const subscription = event.data.object;
    await StripeService.syncStripeSubscriptionToDB(subscription);
}

async function _handleSubscriptionDeleted(event) {
    const subscription = event.data.object;
    const subscriptionID = subscription.id;
    const status = subscription.status;

    // Terminate the subscription
    let query = `UPDATE ${Subscription.tableName()} SET dateCanceled = from_unixtime(?), dateTerminated = NOW(), status = ? WHERE id = ?`;
    const queryValues = [subscription.canceled_at, status, subscription.id];
    await Subscription.query(query, queryValues);

    // Switch user from this deleted plan back to the free plan.
    query = `UPDATE ${User.tableName()} SET subscriptionID = freeSubscriptionID WHERE id = ? AND subscriptionID = ?`;
    await User.query(query, [subscription.metadata.clientUserID, subscriptionID]);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));