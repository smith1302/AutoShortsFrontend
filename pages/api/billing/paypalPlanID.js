import ApiHandler from '~/src/Services/ApiHandler';
import Plan from '~/src/Models/DBModels/Plan';
import PayPalService from '~/src/Services/PayPalService';

/*
    1. Lookup the PayPal plan ID in the database.
    2. If there isn't one this plan is new so we need to register it with PayPal first, then save it in our DB.
    3. Return the PayPal plan ID.
*/

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const { planID } = req.body;
    const priceModel = await Plan.findOne({where: {id: planID}});

    let paypalPlanID = priceModel.paypalPlanID();
    if (!paypalPlanID) {
        paypalPlanID = await registerPlanWithPayPal(priceModel);
    }

    return res.status(200).json({paypalPlanID: paypalPlanID});
});

async function registerPlanWithPayPal(priceModel) {
    const paypalPlanID = await PayPalService.createPlan(priceModel);
    
    if (!paypalPlanID) throw new Error("Could not register plan with PayPal");

    await priceModel.updatePayPalPlanID(paypalPlanID);

    return paypalPlanID;
}