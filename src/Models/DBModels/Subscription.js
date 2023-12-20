import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';
import User from '~/src/Models/DBModels/User';
import PayPalService from '~/src/Services/PayPalService';
import StripeService from '~/src/Services/StripeService';
import { SubscriptionStatus, SubscriptionSource, DBBillingInterval } from '~/src/enums';

import { STRIPE_SECRET, WEBHOOK_KEY } from '~/src/StripeConfig';
const stripe = require('stripe')(STRIPE_SECRET);

/*

The user's active subscription is linked in the user table. Once the subscription is terminated, the user table will link to their "free" subscription.

# Subscription Status (using the status() method):

active: User has an active subscription that has not been canceled.
canceled: User has canceled their subscription and it will end at `currentPeriodEnd`.
terminated: The subscription has passed currentPeriodEnd and is no longer valid.

# Cancelations

- Stripe:
    Once the user cancels, their raw subscription status remains 'active' but the dateCanceled field will be set. 
    We use the `status()` method to augment this because in our perspective this should be a canceled status.
    Once the current period ends, we set 'dateTerminated' and update the user's active subscription back to the free plan.

- PayPal:
    Unlike Stripe, once the user cancels the raw subscription status becomes 'canceled'. They do not send a webhook event when the current period ends,
    so we run a cron job `/api/cron/terminatePaypalChecker` to manually mark a subscription as terminated once the current date passes currentPeriodEnd.

# Usage Resets

    For monthly plans, we just use the webhooks.

*/

export default class Subscription extends DatabaseModel {

    static Status = SubscriptionStatus;
    static Source = SubscriptionSource;

    static Type = {
        Recurring: 'recurring',
        Lifetime: 'lifetime'
    }

    constructor({ 
        id, 
        amount, 
        userID,
        status, 
        billingInterval, 
        currentPeriodEnd, // When the current billing period ends. 
        nextRefresh,
        planID, 
        dateCanceled, 
        dateTerminated, 
        created, 
        source,
        test
    }) {
        super();
        this.id = id;
        this.amount = amount;
        this.userID = userID;
        // The status provided by Stripe/Payment Processors. Use the `status` method instead to augment it for consistency.
        this.rawStatus = status;
        this.billingInterval = billingInterval;
        this.currentPeriodEnd = currentPeriodEnd;
        this.nextRefresh = nextRefresh;
        this.planID = planID;
        this.dateCanceled = dateCanceled;
        this.dateTerminated = dateTerminated;
        this.created = created;
        this.source = source;
        this.test = test;
    }

    status() {
        // Stripe's status remains ACTIVE even after canceling until the period ends.
        // We added a new state 'terminated' to indicate period ends.
        // Active -> user cancels -> Canceled -> period ends -> Terminates
        if (this.rawStatus == SubscriptionStatus.ACTIVE && this.dateCanceled != null) {
            return SubscriptionStatus.CANCELED;
        }
        if (this.rawStatus == SubscriptionStatus.CANCELED && this.dateTerminated != null) {
            return SubscriptionStatus.TERMINATED
        }
        // We don't have trial periods (this state is only used as a means to alter billing anchors), so we treat them as active.
        if (this.rawStatus == "trialing") {
            return SubscriptionStatus.ACTIVE;
        }
        return this.rawStatus;
    }

    /*
        Cancel the user's subscription with the merchant.
        Stripe is the only one that gives us the option to cancel at the period end.
        All our database tracking of this is handled in the webhooks of each merchant.
    */
    async cancel({atStripePeriodEnd = true} = {atStripePeriodEnd: true}) {
        if (this.id.includes("free_")) return;
        
        if (this.source == SubscriptionSource.Stripe) {
            if (atStripePeriodEnd) {
                return stripe.subscriptions.update(this.id, {cancel_at_period_end: true});
            } else {
                return stripe.subscriptions.del(this.id);
            }
        } else if (this.source == SubscriptionSource.PayPal) {
            return PayPalService.cancelSubscription(this.id);
        } else {
            throw new Error(`Unhandled subscription source: ${this.source}`);
        }
    }

    /*
        Checks that the subscription is in a state that allows cancellation.
    */
    canCancel() {
        return this.rawStatus == SubscriptionStatus.ACTIVE || this.rawStatus == Subscription.Status.PAST_DUE;
    }

    hasMembershipAccess() {
        const status = this.status();
        return status == SubscriptionStatus.ACTIVE 
        || status == SubscriptionStatus.CANCELED
        || status == SubscriptionStatus.TRIAL;
    }

    async calculateProrateCredit() {
        if (this.source == SubscriptionSource.Stripe) {
            return StripeService.calculateProrateCredit(this.id);
        } else if (this.source == SubscriptionSource.PayPal) {
            return PayPalService.calculateProrateCredit(this.id);
        } else {
            throw new Error(`calculateProrateCredit: Unhandled subscription source: ${this.source}`);
        }
    }

    static normalizeStatus(status) {
        const lowercaseStatus = status.toLowerCase();
        switch (lowercaseStatus) {
            case 'active':
                return SubscriptionStatus.ACTIVE;
            case 'canceled':
            case 'cancelled':
                return SubscriptionStatus.CANCELED;
            default:
                return lowercaseStatus;
        }
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new Subscription({
            id: data.id,
            amount: data.amount,
            userID: data.userID,
            status: data.status,
            billingInterval: data.billingInterval,
            currentPeriodEnd: data.currentPeriodEnd,
            nextRefresh: data.nextRefresh,
            planID: data.planID,
            dateCanceled: data.dateCanceled,
            dateTerminated: data.dateTerminated,
            source: data.source,
            created: data.created,
        });
    }

    static tableName() {
        return "Subscription";
    }

    /* ==== DB Helpers ==== */

    static async create({subscriptionID, userID, amount, status, billingInterval, planID, source=SubscriptionSource.Stripe}) {
        const query = `
            INSERT IGNORE INTO ${this.tableName()}
            (id, userID, amount, status, billingInterval, planID, source)
            VALUES
            (?, ?, ?, ?, ?, ?, ?)
        `;
        const queryValues = [subscriptionID, userID, amount, status, billingInterval, planID, source];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }

    static async createFreePlan({userID, planID}) {
        const subscriptionID = `free_${userID}`;
        const query = `
            INSERT IGNORE INTO ${this.tableName()}
            (id, userID, source, amount, planID)
            VALUES
            (?, ?, ?, ?, ?)
        `;
        const queryValues = [subscriptionID, userID, SubscriptionSource.Custom, 0, planID];
        const response = await this.query(query, queryValues);
        return subscriptionID;
    }

    static async getUserSubscription(userID) {
        const query = `
            SELECT s.* 
            FROM ${User.tableName()} as u
            JOIN ${this.tableName()} as s
                ON u.subscriptionID = s.id
            WHERE u.id = ?
        `;
        const subscriptions = await this.query(query, [userID]);
        if (!subscriptions?.length) return null;
        return subscriptions[0];
    }

    /*
        Important: Make sure the database has all the updated information before calling this:
        - currentPeriodEnd

        Updates the subscription's next refresh date.
        This is called after a successful monthly payment, or monthly interval if on an annual plan.
    */
    static async renew(subscriptionID) {
        // Either manually move the refresh date one month out or match currentPeriodEnd, depending on the billing interval.
        const nextRefresh = `
            IF(
                billingInterval = '${DBBillingInterval.MONTH}', 
                currentPeriodEnd, 
                IF(currentPeriodEnd IS NOT NULL, LEAST(currentPeriodEnd, DATE_ADD(NOW(), INTERVAL 1 MONTH)), DATE_ADD(NOW(), INTERVAL 1 MONTH))
            )
        `;
        const query = `
            UPDATE ${Subscription.tableName()} 
            SET nextRefresh = ${nextRefresh}
            WHERE id = ?
        `;
        await Subscription.query(query, [subscriptionID]);
    }
}