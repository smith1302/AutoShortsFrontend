import paths from '~/src/paths';
import BillingIntervalHelper from '~/src/Models/BillingIntervalHelper';
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

    const { planID } = req.body;
    const userID = req.user.id;
    const user = await User.findOne({where: {id: userID}});
    const newPriceModel = await Plan.findOne({where: {id: planID}});
    const currentSubscription = await User.getSubscription(userID);

    await stripe.subscriptions.update(
        currentSubscription.id,
        {
            items: [{
                price_data: StripeService.stripePriceDataForPlan(newPriceModel),
                quantity: 1,
            }],
            metadata: StripeService.stripeSubscriptionMetadataForPlan(newPriceModel, user.id),
            proration_behavior: 'always_invoice'
        }
    );

    await logEvent(user.id, priceModel.name);
    return res.status(200).json({sessionURL: session.url});
});

async function logEvent(userID, modelName) {
    try {
        await Event.create({userID: userID, name: 'Upgraded Plan', data: modelName});
    } catch (err) {}
}