import ApiHandler from '~/src/Services/ApiHandler';
import Plan from '~/src/Models/DBModels/Plan';
import { PlanBillingInterval } from '~/src/enums';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    let plans = await Plan.find({where: {available: true}, orderBy: {fieldName: 'price', direction: 'ASC'}});
    return res.status(200).json({plans});
});