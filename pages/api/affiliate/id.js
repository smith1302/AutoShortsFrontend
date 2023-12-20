import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;
    const affiliateID = req.body?.affiliateID;
    if (!affiliateID) throw new Error("Must set an ID");

    const existingUser = await User.findOne({where: {affiliateID: affiliateID}});
    if (existingUser) throw new Error("This ID has been claimed by another affiliate.");

    await User.update({affiliateID: affiliateID}, userID);

    return res.status(200).json({success: true});
});