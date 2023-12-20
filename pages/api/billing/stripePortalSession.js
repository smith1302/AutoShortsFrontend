import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';
import paths from '~/src/paths';
import { STRIPE_SECRET } from '~/src/StripeConfig';
const stripe = require('stripe')(STRIPE_SECRET);

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const { returnURL } = req.body;
    const user = await User.findOne({where: {id: req.user.id}});

    // Authenticate your user.
    const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerID,
        return_url: returnURL,
    });

    return res.status(200).json({sessionURL: session.url});
});