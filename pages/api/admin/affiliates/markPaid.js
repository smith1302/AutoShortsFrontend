import ApiHandler from '~/src/Services/ApiHandler';
import PayPalService from '~/src/Services/PayPalService';
import Affiliate from '~/src/Models/Affiliate/Affiliate';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'POST') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    
    if (!req.user.master) {
        throw new Error(`Not admin`);
    }

    const affiliateID = req.body.affiliateID;
    if (!affiliateID) {
        throw new Error(`No affiliateID`);
    }

    await Affiliate.markAffiliatePaymentsAsPaid(affiliateID);

    return res.status(200).json({});
});