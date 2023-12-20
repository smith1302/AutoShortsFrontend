import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';
import EmailCampaign from '~/src/Models/DBModels/EmailCampaign';
import SendGrid from '~/src/Models/SendGrid';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const { key } = req.query;
    if (!key) throw new Error("Missing key");
    if (key != "837mycronkey") throw new Error("Incorrect cron key");

    /*
        Get users that meet the following:
            - Account age is between 1-2 days.
            - Has not been sent this campaign's email.
            - Is on the free plan.
    */
    const campaignName = 'discountv1';
    const pendingUsers = await User.query(`
        SELECT User.*
        FROM ${User.tableName()} as User
        LEFT JOIN (
            SELECT *
            FROM ${EmailCampaign.tableName()} 
            WHERE name = ?
        ) as EmailCampaign
            ON User.id = EmailCampaign.userID
        WHERE User.created <= NOW() - INTERVAL 1 DAY
            AND User.created > NOW() - INTERVAL 2 DAY
            AND EmailCampaign.name IS NULL
            AND User.subscriptionID = User.freeSubscriptionID
            AND User.canEmail = true
            AND User.email IS NOT NULL
    `, [campaignName]);

    for (const pendingUser of pendingUsers) {
        const alreadySent = await EmailCampaign.findOne({where: {userID: pendingUser.id, name: campaignName}});
        if (alreadySent) continue;

        await SendGrid.discountV1(pendingUser.email).send();
        await EmailCampaign.create({userID: pendingUser.id, name: campaignName});
        await sleep(500);
    }

    return res.status(200).json({success: true});
});

const sleep = ms => new Promise(r => setTimeout(r, ms));