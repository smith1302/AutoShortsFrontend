const SubscriptionStatus = {
    ACTIVE: 'active',
    CANCELED: 'canceled', // canceled, but membership is still active until period ends.
    TERMINATED: 'terminated', // canceled and period has ended.
    TRIAL: 'trial',
    PAST_DUE: 'past_due'
}

const SubscriptionSource = {
    Stripe: 'Stripe',
    PayPal: 'Paypal',
    Custom: 'custom'
}

const RefillPaymentSource = {
    Stripe: 'Stripe',
    PayPal: 'Paypal',
}

const RegisterSource = {
    Google: 'google',
    Manual: 'manual'
}

// For use in price card
const PlanBillingInterval = {
    MONTHLY: "monthly",
    YEARLY: "yearly",
    ONCE: "once"
}

// Value stored in our DB
const DBBillingInterval = {
    MONTH: "month",
    YEAR: "year"
}

export {
    SubscriptionStatus,
    SubscriptionSource,
    RegisterSource,
    PlanBillingInterval,
    DBBillingInterval,
    RefillPaymentSource,
}