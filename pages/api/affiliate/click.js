import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';
import AffiliateClick from '~/src/Models/Affiliate/AffiliateClick';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const affiliateID = req.body.affiliateID;
    const affiliate = await User.findOne({where: {affiliateID: affiliateID}});
    if (affiliate) {
        const IP = (req.headers && req.headers['x-real-ip']) ? req.headers['x-real-ip'] : '';
        await AffiliateClick.create({userID: affiliate.id, IP})
    }

    return res.status(200).json({success: true});
});