const GOOGLE_CLIENT_ID = "262744178120-m5ptibpi8ul0kj4jb76cf63esmdh0v2i.apps.googleusercontent.com";

const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY;
const PAYPAL_CLIENT_KEY = process.env.USE_PAYPAL_TEST == 1 ? process.env.PAYPAL_CLIENT_KEY_TEST : process.env.PAYPAL_CLIENT_KEY;

module.exports = {
    distDir: process.env.BUILD_DIR || '.next',
    serverRuntimeConfig: {
        JWTSecret: 'zippidydooda',
        GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID
    },
    publicRuntimeConfig: {
        GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID,
        PAYPAL_CLIENT_KEY: PAYPAL_CLIENT_KEY,
        RECAPTCHA_SITE_KEY: RECAPTCHA_SITE_KEY
    }
}