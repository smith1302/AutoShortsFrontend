const { default: axios } = require('axios');
import getRawBody from "raw-body";
import globals from "~/src/globals";
import BillingIntervalHelper from '~/src/Models/BillingIntervalHelper';

let config;
if (process.env.USE_PAYPAL_TEST == "1") {
    // TEST SETTINGS
    config = {
        PAYPAL_CLIENT: process.env.PAYPAL_CLIENT_KEY_TEST,
        PAYPAL_SECRET: process.env.PAYPAL_SECRET_KEY_TEST,
        WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID_TEST,
        MODE: 'sandbox',
        ENDPOINT_BASE: 'https://api-m.sandbox.paypal.com',
        PRODUCT_ID: 'PROD-6TE483543W2143938'
    };
} else {
    // LIVE SETTINGS
    config = {
        PAYPAL_CLIENT: process.env.PAYPAL_CLIENT_KEY,
        PAYPAL_SECRET: process.env.PAYPAL_SECRET_KEY,
        WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID,
        MODE: 'live',
        ENDPOINT_BASE: 'https://api-m.paypal.com',
        PRODUCT_ID: 'PROD-0PX687718X211980Y'
    };
}

export default class PayPalService {

    static config() {
        return config;
    }

    static async getPayPalAccessToken() {
        const client_id = config.PAYPAL_CLIENT;
        const client_secret = config.PAYPAL_SECRET;
        const options = {
            url: `${config.ENDPOINT_BASE}/v1/oauth2/token`,
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-Language': 'en_US',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            auth: {
                username: client_id,
                password: client_secret,
            },
            params: {
                grant_type: 'client_credentials',
            },
        };
        const { status, data } = await axios(options);
        return data.access_token;
    };

    static async verifyWebhookHack(req, webhookID) {
        const hasAllRequiredHeaders = requiredHeaders.every((requiredHeader) => {
            returnreq.headers.hasOwnProperty(requiredHeader);
        })
        if (!hasAllRequiredHeaders) {
            throw new Error("Could not verify PayPal webhook");
        }
        return hasAllRequiredHeaders;
    }

    static async verifyWebhook(req, webhookID) {
        const token = await this.getPayPalAccessToken();
        const headers = req.headers;
        const params = {
            "transmission_id": headers["paypal-transmission-id"],
            "transmission_time": headers["paypal-transmission-time"],
            "cert_url": headers["paypal-cert-url"],
            "auth_algo": headers["paypal-auth-algo"],
            "transmission_sig": headers["paypal-transmission-sig"],
            "webhook_id": webhookID,
            "webhook_event": req.body
        };
        const options = {
            method: 'POST',
            url: `${config.ENDPOINT_BASE}/v1/notifications/verify-webhook-signature`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            data: params
        };
        let status, data = {};
        try {
            const response = await axios(options);
            status = response.status;
            data = response.data || {};
        } catch (err) {
            console.log("[PayPal Service] Hit an error with verifyWebhook...");
            console.log(err["response"]["data"]);
        }
        const isVerified = status == 200;
        return isVerified;
    };

    static async createProduct() {
        const token = await this.getPayPalAccessToken();
        const options = {
            method: 'POST',
            url: `${config.ENDPOINT_BASE}/v1/catalogs/products`,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'PayPal-Request-Id': `product-1234`,
            },
            data: {
                "name": "EcomWave",
                "description": "Advanced Ecommerce Analytics",
                "type": "DIGITAL",
                "category": "SOFTWARE",
                "image_url": "https://ecomwave.io/images/LogoGradient.png",
                "home_url": "https://ecomwave.io"
            }
        };
        let status, data = {};
        try {
            const response = await axios(options);
            status = response.status;
            data = response.data || {};
        } catch (err) {
            console.log("[PayPal Service] Hit an error with createProduct...");
            console.log(err["response"]["data"]);
        }
        

        let productID = status == 201 ? data.id : null;
        return productID;
    };

    static async createPlan(priceModel) {
        const uniqueID = priceModel.id;
        const name = priceModel.name;
        const description = priceModel.description();
        const price =  priceModel.price;
        const interval = BillingIntervalHelper.fromPlanToPayPalInterval(priceModel.billingInterval);

        const token = await this.getPayPalAccessToken();
        const productID = config.PRODUCT_ID;
        const options = {
            method: 'POST',
            url: `${config.ENDPOINT_BASE}/v1/billing/plans`,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'PayPal-Request-Id': `PLAN-${uniqueID}`,
            },
            data: {
                "product_id": productID,
                "name": name,
                "description": description,
                "billing_cycles": [
                    {
                        "frequency": {
                            "interval_unit": interval,
                            "interval_count": 1
                        },
                        "tenure_type": "REGULAR",
                        "sequence": 1,
                        "total_cycles": 0,
                        "pricing_scheme": {
                            "fixed_price": {
                                "value": price, // in dollars
                                "currency_code": "USD"
                            }
                        }
                    }
                ],
                "payment_preferences": {
                    "auto_bill_outstanding": true,
                    "setup_fee": {
                        "value": "0",
                        "currency_code": "USD"
                    },
                    "setup_fee_failure_action": "CONTINUE",
                    "payment_failure_threshold": 1
                },
                "status": "ACTIVE"
            }
        };
        let status, data = {};
        try {
            const response = await axios(options);
            status = response.status;
            data = response.data || {};
        } catch (err) {
            console.log("[PayPal Service] Hit an error with createPlan...");
            console.log(err);
        }

        let planID = status == 201 ? data.id : null;
        return planID;
    };


    static async getSubscription(id) {
        const token = await this.getPayPalAccessToken();
        const options = {
            method: 'GET',
            url: `${config.ENDPOINT_BASE}/v1/billing/subscriptions/${id}`,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            }
        };
        let status, data = null;
        try {
            const response = await axios(options);
            status = response.status;
            data = response.data;
        } catch (err) {
            console.log("[PayPal Service] Hit an error with getSubscription...");
            console.log(err);
        }

        return data;
    };

    static async cancelSubscription(id, reason='none') {
        const token = await this.getPayPalAccessToken();
        const options = {
            method: 'POST',
            url: `${config.ENDPOINT_BASE}/v1/billing/subscriptions/${id}/cancel`,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            data: {
                'reason': reason
            }
        };
        let status, data = null;
        try {
            const response = await axios(options);
            status = response.status;
            data = response.data;
        } catch (err) {
            console.log("[PayPal Service] Hit an error with cancelSubscription...");
            console.log(err);
        }

        return data;
    };

    static async sendAffiliatePayout(affiliateItems) {

        const currentYearAndMonth = new Date().toISOString().slice(0, 7);
        const randomString = String(Date.now()).slice(-5);
        const senderBatchHeader = {
            "sender_batch_id": `AffiliatePayout-${currentYearAndMonth}-${randomString}`,
            "email_subject": `${globals.appName} Affiliate Payout`,
            "email_message": "You have received a payout! Thanks for your service!"
        }

        const items = affiliateItems.map((item) => {
            return {
                "recipient_type": "EMAIL",
                "amount": {
                    "value": item.amount,
                    "currency": "USD"
                },
                "receiver": item.paypal
            }
        });
        const token = await this.getPayPalAccessToken();
        const options = {
            method: 'POST',
            url: `${config.ENDPOINT_BASE}/v1/payments/payouts`,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            data: {
                "sender_batch_header": senderBatchHeader,
                "items": items
            }
        };

        let success = false;
        try {
            const response = await axios(options);
            success = response.status == 201;
        } catch (err) {
            console.log("[PayPal Service] Hit an error with sendAffiliatePayout...");
            console.log(err["response"]["data"]);
        }
    
        return success;
    };

    static async calculateProrateCredit(subscriptionID) {
        if (!subscriptionID) return 0;
        const subscription = await this.getSubscription(subscriptionID);
        const amount = subscription.billing_info.last_payment.amount.value;
        const currentPeriodEnd = new Date(subscription.billing_info.next_billing_time);
        const currentPeriodStart = new Date(subscription.billing_info.last_payment.time);
        const periodDifference = currentPeriodEnd - currentPeriodStart;
        const timeLeft = currentPeriodEnd - Date.now();
        const percentLeft = timeLeft / periodDifference;
        return Math.max(0, Math.floor(amount * percentLeft));
    }
}