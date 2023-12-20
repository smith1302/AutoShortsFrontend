import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';
import Payment from '~/src/Models/DBModels/Payment';
import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';
import Plan from '~/src/Models/DBModels/Plan';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'POST') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;
    await User.terminatePayPalSubscriptionCheck(userID);
    
    const subscription = await User.getSubscription(userID);
    const user = await User.findOne({where: {id: userID}});
    const payments = await Payment.find({where: {userID: userID}});
    const allPlans = await Plan.find({orderBy: {fieldName: 'price', direction: 'ASC'}});

    let relevantPlans = allPlans.filter(ele => ele.available);
    relevantPlans = relevantPlans.filter(plan => plan.webEnabled);

    const PTABLE = Plan.tableName();
    const customUserPlans = await Plan.awaitableQuery(`
        SELECT ptable.* 
        FROM ${PTABLE} as ptable
            JOIN CustomUserPlan
        ON CustomUserPlan.planID = ptable.id 
        WHERE userID = ?
            AND ptable.id IS NOT NULL
    `, [userID]);

    const response = {
        currentPeriodEnd: subscription.currentPeriodEnd,
        nextRefresh: subscription.nextRefresh,
        subscriptionPrice: subscription.amount,
        subscriptionStatus: subscription.status(),
        subscriptionSource: subscription.source,
        stripeCustomerID: user.stripeCustomerID,
        subscriptionID: subscription.id,
        currentPlan: allPlans.find(ele => ele.id == subscription.planID),
        paymentHistoryCount: payments?.length || 0,
        plans: relevantPlans,
        customUserPlans: customUserPlans
    }

    return res.status(200).json(response);
});