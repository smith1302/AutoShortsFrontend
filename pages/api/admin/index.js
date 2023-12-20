import ApiHandler from '~/src/Services/ApiHandler';
import { DBBillingInterval } from '~/src/enums';
import Event from '~/src/Models/DBModels/Event';
import User from '~/src/Models/DBModels/User';
import Subscription from '~/src/Models/DBModels/Subscription';
import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'GET') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    
    if (!req.user.master) {
        throw new Error(`Not admin`);
    }

    let query = `
        SELECT a.*, b.lastEvent, User.subscriptionID
        FROM (
            SELECT userID, count(*) as eventCount FROM ${Event.tableName()} WHERE userID != '' GROUP BY userID
            ) as a 
        JOIN (
            SELECT MAX(created) as lastEvent, userID FROM ${Event.tableName()} GROUP BY userID
            ) as b 
            ON a.userID = b.userID 
        JOIN User
            ON User.id = b.userID
        WHERE b.lastEvent > NOW() - INTERVAL 3 DAY
        ORDER BY b.lastEvent DESC
        LIMIT 10
    `;
    const events = await Event.awaitableQuery(query);

    query = `
        SELECT COUNT(*) as total
        FROM ${User.tableName()}
        WHERE created > NOW() - INTERVAL 1 DAY
            AND User.master = 0
    `;
    let result = await User.awaitableQuery(query);
    const recentAccounts = result[0].total;

    query = `
        SELECT SUM(IF(Subscription.billingInterval = "${DBBillingInterval.MONTH}", Subscription.amount, Subscription.amount/12)) as MRR, COUNT(*) subscriberCount
        FROM ${Subscription.tableName()}
        JOIN User
            ON User.id = Subscription.userID
        WHERE Subscription.status="active" 
            AND Subscription.dateCanceled IS NULL
            AND User.master = 0
            AND (Subscription.billingInterval = "${DBBillingInterval.MONTH}" OR Subscription.billingInterval = "${DBBillingInterval.YEAR}")
    `;
    result = await Subscription.awaitableQuery(query);
    const revenueInfo = result[0];

    query = `
        SELECT SUM(amount) as totalPayments
        FROM Payment
        JOIN User
            ON User.id = Payment.userID
        WHERE Payment.created > NOW() - INTERVAL 1 MONTH
        AND User.master = 0
    `;
    result = await DatabaseModel.awaitableQuery(query);
    const paymentSum = result[0].totalPayments;

    query = `
        SELECT SUM(Payment.amount)*0.3 as unpaid, Affiliate.affiliateID 
        FROM Payment
        JOIN User
            ON Payment.userID = User.ID
        JOIN User as Affiliate
            ON User.affiliateRef = Affiliate.affiliateID
        WHERE Payment.hasPaidAffiliate = 0
            AND User.affiliateRef IS NOT NULL
            AND User.affiliateRef != ""
        GROUP BY Affiliate.affiliateID
        ORDER BY unpaid DESC
    `;
    result = await DatabaseModel.awaitableQuery(query);
    const affiliateStats = result;

    query = `
        SELECT User.email, User.referralQueryParams, User.referralURL, User.affiliateRef, Plan.name, Subscription.*
        FROM Subscription
        JOIN User
            ON User.id = Subscription.userID
        JOIN Plan
            ON Plan.id = Subscription.planID
        WHERE Subscription.amount > 0
            AND Subscription.source != 'custom'
            AND Subscription.status != 'incomplete_expired'
            AND currentPeriodEnd IS NOT NULL
            AND User.master = 0
        ORDER BY Subscription.created DESC
        LIMIT 20
    `;
    result = await DatabaseModel.awaitableQuery(query);
    const recentSubscribers = result;

    const numDays = 7;
    query = `
        SELECT upgradeCount.time, 
                upgradeCount.total as upgraded, 
                IF(cancelCount.total, cancelCount.total, 0) as canceled,
                IF(pastDueCount.total, pastDueCount.total, 0) as pastDue, 
                (upgradeCount.total - IF(cancelCount.total, cancelCount.total, 0) - IF(pastDueCount.total, pastDueCount.total, 0)) as net,
                upgradeCount.inflow,
                (IF(pastDueCount.outflow, pastDueCount.outflow, 0) + IF(cancelCount.outflow, cancelCount.outflow, 0)) as outflow, 
                (upgradeCount.inflow - IF(cancelCount.total, cancelCount.outflow, 0) - IF(pastDueCount.outflow, pastDueCount.outflow, 0)) as flow,
                registers.total as registers
        FROM (
                SELECT DATE_FORMAT(upgrades.created, '%Y-%m-%d') as time, COUNT(*) as total, SUM(amount) as inflow
                FROM (
                        SELECT Subscription.*
                        FROM Subscription
                        JOIN User
                            ON User.id = Subscription.userID
                        WHERE Subscription.source != 'custom'
                        AND Subscription.amount > 0
                        AND Subscription.status != 'incomplete_expired'
                        AND Subscription.currentPeriodEnd IS NOT NULL
                        AND User.master = 0
                    ) as upgrades
                GROUP BY time
                ORDER BY time DESC
                LIMIT ${numDays}
            ) as upgradeCount
        LEFT JOIN (
                SELECT DATE_FORMAT(upgrades.dateCanceled, '%Y-%m-%d') as time, COUNT(*) as total, SUM(amount) as outflow
                FROM (
                        SELECT Subscription.*
                        FROM Subscription
                        JOIN User
                            ON User.id = Subscription.userID
                        WHERE Subscription.source != 'custom'
                        AND Subscription.amount > 0
                        AND Subscription.status != 'incomplete_expired'
                        AND Subscription.currentPeriodEnd IS NOT NULL
                        AND User.master = 0
                    ) as upgrades
                GROUP BY time
            ) as cancelCount
            ON upgradeCount.time = cancelCount.time
        LEFT JOIN (
                SELECT DATE_FORMAT(upgrades.updated, '%Y-%m-%d') as time, COUNT(*) as total, SUM(amount) as outflow
                FROM (
                        SELECT Subscription.*
                        FROM Subscription
                        JOIN User
                            ON User.id = Subscription.userID
                        WHERE Subscription.source != 'custom'
                        AND Subscription.amount > 0
                        AND (Subscription.status = 'past_due' OR Subscription.status = 'frozen')
                        AND User.master = 0
                    ) as upgrades
                GROUP BY time
            ) as pastDueCount    
            ON pastDueCount.time = upgradeCount.time
        LEFT JOIN (
                SELECT DATE_FORMAT(created, '%Y-%m-%d') as time, COUNT(*) as total
                FROM User
                GROUP BY time
            ) as registers    
            ON registers.time = upgradeCount.time
        ORDER BY upgradeCount.time DESC
    `;
    result = await DatabaseModel.awaitableQuery(query);
    const growthTable = result;

    const MRR = revenueInfo.MRR;
    const subscriberCount = revenueInfo.subscriberCount;
    const revenueStats = {MRR, subscriberCount};
    return res.status(200).json({events, recentAccounts, revenueStats, affiliateStats, recentSubscribers, growthTable, paymentSum});
});