import globals from '~/src/globals.js';
import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';
import { SubscriptionStatus } from '~/src/enums';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const subscription = await User.getSubscription(req.user.id);
    // Cancel the subscription at the end of their billing cycle.
    // If the subscription is past_due, cancel right away
    await subscription.cancel({atStripePeriodEnd: subscription.rawStatus !== SubscriptionStatus.PAST_DUE});

    return res.status(200).json({success: true});
});