import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';
import Subscription from '~/src/Models/DBModels/Subscription';
import EmailCampaign from '~/src/Models/DBModels/EmailCampaign';
import SendGrid from '~/src/Models/SendGrid';
import { SubscriptionStatus, SubscriptionSource } from '~/src/enums';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const { key } = req.query;
    if (!key) throw new Error("Missing key");
    if (key != "837mycronkey") throw new Error("Incorrect cron key");

    /*
        #### IMPORTANT: Check User.terminatePayPalSubscriptionCheck too if changing this.

        Below we are just grabbing all PayPal subscriptions that haven't been terminated but have passed their currentPeriodEnd.
        - If the status is active, this means we are in a "retry failed payment state, so we will update the status.
        - Otherwise, we will terminate the subscription.
        - We additionally check that `NOW() > updated + INTERVAL 30 MINUTE` which covers this failed payment edge case:
            - The payment has failed a bunch so NOW() is well past currentPeriodEnd. The user cancels but maybe currentPeriodEnd hasn't updated yet from the webhook? Idk the problem exactly but this gives the webhook some time.
    */
    const pendingTerminations = await Subscription.query(`
        SELECT *
        FROM ${Subscription.tableName()}
        WHERE NOW() > currentPeriodEnd + INTERVAL 1 HOUR
        AND NOW() > updated + INTERVAL 30 MINUTE
        AND (
                status = "${SubscriptionStatus.CANCELED}"
                OR status = "${SubscriptionStatus.ACTIVE}"
                OR status = "suspended"
            )
        AND source = "${SubscriptionSource.PayPal}"
        AND dateTerminated IS NULL
    `);

    for (const pendingTermination of pendingTerminations) {
        const userID = pendingTermination.userID;
        const status = pendingTermination.rawStatus;
        console.log(`[${status}] Found a subscription for user ${userID} that needs termination. Subscription ID: ${pendingTermination.id}`);
        
        // If we are past the current period end and status is active = the payment is overdue.
        if (status == SubscriptionStatus.ACTIVE) {
            let query = `UPDATE ${Subscription.tableName()} SET status = 'past_due' WHERE id = ?`;
            await Subscription.query(query, [pendingTermination.id]);
        } else {
        // If we are past the current period end and status is canceled = the user canceled the subscription.
            // Terminate the subscription
            let query = `UPDATE ${Subscription.tableName()} SET dateTerminated = NOW(), dateCanceled = IF(dateCanceled IS NULL, NOW(), dateCanceled), status = 'canceled' WHERE id = ?`;
            await Subscription.query(query, [pendingTermination.id]);

            // Switch user from this deleted plan back to the free plan.
            query = `UPDATE ${User.tableName()} SET subscriptionID = freeSubscriptionID WHERE id = ? AND subscriptionID = ?`;
            await User.query(query, [userID, pendingTermination.id]);
        }
        
        await sleep(500);
    }

    return res.status(200).json({success: true});
});

const sleep = ms => new Promise(r => setTimeout(r, ms));