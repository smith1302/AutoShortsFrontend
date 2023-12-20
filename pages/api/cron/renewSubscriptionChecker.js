import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';
import Subscription from '~/src/Models/DBModels/Subscription';
import { SubscriptionStatus, SubscriptionSource, DBBillingInterval } from '~/src/enums';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const { key } = req.query;
    if (!key) throw new Error("Missing key");
    if (key != "837mycronkey") throw new Error("Incorrect cron key");

    /*
        Find subscriptions that need a refresh:
        1. All annual / LTD subscriptions
    */
    let pendingSubscriptions = await Subscription.query(`
        SELECT *
        FROM ${Subscription.tableName()}
        WHERE NOW() > nextRefresh
        AND (
                status = "${SubscriptionStatus.CANCELED}"
                OR status = "${SubscriptionStatus.ACTIVE}"
            )
        AND billingInterval != "${DBBillingInterval.MONTH}"
        AND dateTerminated IS NULL
    `);

    for (const pendingSubscription of pendingSubscriptions) {
        const userID = pendingSubscription.userID;
        console.log(`Found an annual/ltd subscription for user ${userID} that needs renewal. Subscription ID: ${pendingSubscription.id}`);
        // Everything else we can assume is an annual subscription, so we can just renew it without syncing.
        await Subscription.renew(pendingSubscription.id);
        await sleep(500);
    }

    return res.status(200).json({success: true});
});

const sleep = ms => new Promise(r => setTimeout(r, ms));