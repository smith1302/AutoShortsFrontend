import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';
import Plan from '~/src/Models/DBModels/Plan';
import Announcement from '~/src/Models/DBModels/Announcement';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'POST') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const subscription = await User.getSubscription(req.user.id);
    const announcements = await Announcement.recentAnnouncements();
    const allPlans = await Plan.find({orderBy: {fieldName: 'price', direction: 'ASC'}});
    const currentPlan = allPlans.find(ele => ele.id == subscription.planID);

    const response = {
        announcements: announcements,
        currentPeriodEnd: subscription.currentPeriodEnd,
        subscriptionStatus: subscription.status(),
        currentPlan: currentPlan,
        nextRefresh: subscription.nextRefresh
    }

    return res.status(200).json(response);
});