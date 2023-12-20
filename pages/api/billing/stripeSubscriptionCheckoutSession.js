import paths from '~/src/paths';
import { DBBillingInterval, PlanBillingInterval } from '~/src/enums';
import ApiHandler from '~/src/Services/ApiHandler';
import StripeService from '~/src/Services/StripeService';
import User from '~/src/Models/DBModels/User';
import Plan from '~/src/Models/DBModels/Plan';
import Event from '~/src/Models/DBModels/Event';
import { STRIPE_SECRET } from '~/src/StripeConfig';
const stripe = require('stripe')(STRIPE_SECRET);

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const { cancelURL, planID } = req.body;
    const userID = req.user.id;
    const user = await User.findOne({where: {id: userID}});
    const priceModel = await Plan.findOne({where: {id: planID}});
    const priceData = StripeService.stripePriceDataForPlan(priceModel);

    let sessionConfig = {
        line_items: [
            {
                price_data: priceData,
                quantity: 1,
            }
        ],
        allow_promotion_codes: true,
        mode: 'subscription',
        subscription_data: {
            metadata: StripeService.stripeSubscriptionMetadataForPlan(priceModel, user.id)
        },
        success_url: `${req.headers.origin}${paths.billingSuccess}?session_id={CHECKOUT_SESSION_ID}&payment=subscription`,
        cancel_url: cancelURL,
        client_reference_id: user.id,
    }

    // Calculate proration amount as a coupon, if necessary.
    const currentSubscription = await User.getSubscription(userID);
    const shouldProrate = shouldProratePlan(currentSubscription, priceModel);
    if (shouldProrate) {
        const prorateCredit = await currentSubscription.calculateProrateCredit();
        if (prorateCredit) {
            const coupon = await stripe.coupons.create({
                amount_off: prorateCredit * 100,
                duration: 'once',
                max_redemptions: 1, 
                currency: 'usd',
                name: 'Prorate Credit'
            });
            sessionConfig.discounts = [{coupon: coupon.id}];
            delete sessionConfig.allow_promotion_codes;
        }
    }

    // If this is a past customer, reuse their customer ID for prefilled card information.
    if (user.stripeCustomerID) {
        sessionConfig.customer = user.stripeCustomerID;
    } else {
        sessionConfig.customer_email = user.email;
    }

    await logEvent(user.id, priceModel.name);

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create(sessionConfig);
    if (!session) {
        throw new Error("Could not create a Stripe checkout session");
    }

    // await Email.devNotification({name: "Checkout session", accountEmail: user.email}).send();

    return res.status(200).json({sessionURL: session.url});
});

function shouldProratePlan(currentSubscription, newPriceModel) {
    if (!currentSubscription) return false;
    // Only pro-rate between two annual plans, where the new plan is more expensive.
    const areBothYearly = newPriceModel.billingInterval == PlanBillingInterval.YEARLY && currentSubscription.billingInterval == DBBillingInterval.YEAR;
    const isNewPlanMoreExpensive = newPriceModel.amount > currentSubscription.amount;
    const canProrate = areBothYearly && isNewPlanMoreExpensive;
    return canProrate;
}

async function logEvent(userID, modelName) {
    try {
        await Event.create({userID: userID, name: 'Billing Portal', data: modelName});
    } catch (err) {}
}