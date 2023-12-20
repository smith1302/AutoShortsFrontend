let config;
if (process.env.USE_STRIPE_TEST == "1") {
    // TEST SETTINGS
    config = {
        STRIPE_PUBLISHABLE: process.env.STRIPE_PUBLIC_KEY_TEST,
        STRIPE_SECRET: process.env.STRIPE_SECRET_KEY_TEST,
        WEBHOOK_KEY: process.env.STRIPE_WEBHOOK_KEY_TEST,
        PRODUCT_ID: 'na'
    };
} else {
    // LIVE SETTINGS
    config = {
        STRIPE_PUBLISHABLE: process.env.STRIPE_PUBLIC_KEY,
        STRIPE_SECRET: process.env.STRIPE_SECRET_KEY,
        WEBHOOK_KEY: process.env.STRIPE_WEBHOOK_KEY,
        PRODUCT_ID: 'na'
    };
}

module.exports = config;