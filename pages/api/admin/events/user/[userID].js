import ApiHandler from '~/src/Services/ApiHandler';
import Event from '~/src/Models/DBModels/Event';
import User from '~/src/Models/DBModels/User';
import Subscription from '~/src/Models/DBModels/Subscription';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'GET') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    
    if (!req.user.master) {
        return res.status(400).end(`Not authorized`);
    }

    const userID = req.query.userID;
    const events = await Event.find({where: {userID: userID}, orderBy: {fieldName: 'created', direction: 'DESC'}, limit: 200});
    const user = await User.findOne({where: {id: userID}});
    const subscription = await Subscription.findOne({where: {id: user.subscriptionID}});
    const matchedIPUsers = (await User.usersWithRecentMatchingIP({IP: user.IP})).filter(account => account.id != userID);

    return res.status(200).json({events, user, similarAccounts: matchedIPUsers});
});