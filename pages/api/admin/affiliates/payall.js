import ApiHandler from '~/src/Services/ApiHandler';
import PayPalService from '~/src/Services/PayPalService';
import Affiliate from '~/src/Models/Affiliate/Affiliate';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'GET') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    
    if (!req.user.master) {
        throw new Error(`Not admin`);
    }

    const affiliates = await Affiliate.getUnpaidAffiliatePayments();
    const affiliateItems = affiliates.map(affiliate => {
        return {
            amount: affiliate.unpaid,
            paypal: affiliate.affiliatePayPal,
        }
    });
    const success = await PayPalService.sendAffiliatePayout(affiliateItems);
    if (!success) {
        throw new Error(`Failed to send affiliate payout`);
    }

    for (const affiliate of affiliates) {
        await Affiliate.markAffiliatePaymentsAsPaid(affiliate.affiliateID);
    }

    return res.status(200).json({});
});