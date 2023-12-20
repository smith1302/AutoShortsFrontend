import ApiHandler from '~/src/Services/ApiHandler';
import { DBBillingInterval } from '~/src/enums';
import Event from '~/src/Models/DBModels/Event';
import Affiliate from '~/src/Models/Affiliate/Affiliate';
import Subscription from '~/src/Models/DBModels/Subscription';
import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'GET') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    
    if (!req.user.master) {
        throw new Error(`Not admin`);
    }

    const affiliates = await Affiliate.getUnpaidAffiliatePayments();

    return res.status(200).json({affiliates});
});