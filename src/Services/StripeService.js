import { STRIPE_SECRET, WEBHOOK_KEY } from '~/src/StripeConfig';
const stripe = require('stripe')(STRIPE_SECRET);
import { DBBillingInterval } from '~/src/enums';
import Plan from '~/src/Models/DBModels/Plan';
import Subscription from '~/src/Models/DBModels/Subscription';
import BillingIntervalHelper from '~/src/Models/BillingIntervalHelper';

export default class StripeService {

    static getSubscriptionAmount(subscription) {
        const price = subscription.items.data[0].price;
        let amount = (price.unit_amount / 100).toFixed(2);
        const coupon = subscription.discount?.coupon;
        if (coupon && coupon.percent_off && coupon.valid) {
            amount = amount * (100 - coupon.percent_off) / 100;
        }
        return amount;
    }

    static async syncStripeSubscriptionToDB(subscription) {
        let status = subscription.status;
        const price = subscription.items.data[0].price;
        const billingInterval = BillingIntervalHelper.fromStripeInterval(price.recurring.interval);
        const currentPeriodEnd = subscription.current_period_end ? `from_unixtime(${subscription.current_period_end})` : 'NULL';
        const canceledAt = subscription.canceled_at ? `from_unixtime(${subscription.canceled_at})` : 'NULL';
        const amount = StripeService.getSubscriptionAmount(subscription);
        const planID = subscription.metadata.clientPlanID;
        const plan = await Plan.findOne({where: {id: planID}});
    
        let nextRefresh = "nextRefresh";
        // For non-monthly subscriptions, a cron job will handle the next refresh date.
        if (billingInterval == DBBillingInterval.MONTH) {
            nextRefresh = currentPeriodEnd;
        }

        // We use a "trial" to change the billing cycle anchor. This is typically in the event of a past_due payment succeeding and needing to reset the billing cycle without billing the user again.
        // Since this is sort of a hack and the user is not actually in a trial, we need to change the status to active.
        if (status == "trialing") {
            status = "active";
        }
    
        const query = `
            UPDATE ${Subscription.tableName()}
            SET amount = ?, 
                billingInterval = ?,
                dateCanceled = ${canceledAt}, 
                currentPeriodEnd = ${currentPeriodEnd}, 
                nextRefresh = ${nextRefresh},
                status = ? 
                WHERE id = ?`;
        const queryValues = [amount, billingInterval, status, subscription.id];
        await Subscription.query(query, queryValues);
    }

    static stripePriceDataForPlan(plan) {
        if (!plan) throw new Error("stripePriceDataForPlan: plan is null");

        const stripeIntervalText = BillingIntervalHelper.fromPlanToStripeInterval(plan.billingInterval);
        return {
            currency: 'usd',
            unit_amount: plan.price*100,
            product_data: {
                name: plan.name,
                description: plan.description(),
            },
            recurring: {
                interval: stripeIntervalText,
            }
        }
    }

    static stripeSubscriptionMetadataForPlan(plan, userID) {
        if (!plan) throw new Error("stripeSubscriptionMetadataForPlan: plan is null");
        return {
            clientPlanID: plan.id,
            clientUserID: userID
        }
    }

    static async calculateProrateCredit(subscriptionID) {
        if (!subscriptionID) return 0;
        const subscription = await stripe.subscriptions.retrieve(subscriptionID);
        const amount = StripeService.getSubscriptionAmount(subscription);
        const periodDifference = subscription.current_period_end - subscription.current_period_start;
        const timeLeft = subscription.current_period_end - Math.floor(Date.now() / 1000);
        const percentLeft = timeLeft / periodDifference;
        return Math.max(0, Math.floor(amount * percentLeft));
    }
}