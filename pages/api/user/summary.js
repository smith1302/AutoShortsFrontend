import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user?.id;

    let subscription;
    let user;
    if (userID) {
        subscription = await User.getSubscription(userID);
        user = await User.findOne({where: {id: userID}});
    }

    const response = {
        subscriptionStatus: subscription?.status(),
        hasMembershipAccess: subscription?.hasMembershipAccess(),
        registerSource: user?.source
    }

    return res.status(200).json(response);
});