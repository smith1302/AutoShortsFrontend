// A set of helper methods to translate various billing intervals.

import { DBBillingInterval, PlanBillingInterval } from '~/src/enums';

const StripeInterval = {
    MONTH: "month",
    YEAR: "year"
}

const PayPalInterval = {
    MONTH: "MONTH",
    YEAR: "YEAR"
}

export default class BillingIntervalHelper {

    /* Converts Stripe's interval string to match our own */
    static fromStripeInterval(stripeInterval) {
        switch (stripeInterval) {
            case StripeInterval.MONTH:
                return DBBillingInterval.MONTH;
            case StripeInterval.YEAR:
                return DBBillingInterval.YEAR;
            default:
                console.log("(fromStripeInterval) Unknown stripe interval: " + stripeInterval);
                return stripeInterval;
        }
    }

    /* Converts the plan model's interval string to match our own */
    static fromPlanModelInterval(planInterval) {
        switch (planInterval) {
            case PlanBillingInterval.MONTHLY:
                return DBBillingInterval.MONTH;
            case PlanBillingInterval.YEARLY:
                return DBBillingInterval.YEAR;
            default:
                console.log("(fromPlanModelInterval) Unknown plan interval: " + planInterval);
                return planInterval;
        }
    }

    /* Converts the plan model's interval string to match stripes */
    static fromPlanToStripeInterval(planInterval) {
        switch (planInterval) {
            case PlanBillingInterval.MONTHLY:
                return StripeInterval.MONTH;
            case PlanBillingInterval.YEARLY:
                return StripeInterval.YEAR;
            default:
                console.log("(fromPlanToStripeInterval) Unknown plan interval: " + planInterval);
                return StripeInterval.MONTH;
        }
    }

    /* Converts the plan model's interval string to match PayPals */
    static fromPlanToPayPalInterval(planInterval) {
        switch (planInterval) {
            case PlanBillingInterval.MONTHLY:
                return PayPalInterval.MONTH;
            case PlanBillingInterval.YEARLY:
                return PayPalInterval.YEAR;
            default:
                console.log("(fromPlanToPayPalInterval) Unknown plan interval: " + planInterval);
                return PayPalInterval.MONTH;
        }
    }
}