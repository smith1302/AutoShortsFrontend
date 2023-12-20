import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';
import AffiliateMessage from '~/src/Models/DBModels/AffiliateMessage';
import Payment from '~/src/Models/DBModels/Payment';
import AffiliateClick from '~/src/Models/Affiliate/AffiliateClick';
import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'GET') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;

    // Check for any ban messages
    const affiliateMessage = await AffiliateMessage.findOne({where: {userID: userID}});
    // if (affiliateMessage && affiliateMessage.type == AffiliateMessage.Type.BAN) {
    //     res.status(200).json({
    //         banned: true,
    //         message: affiliateMessage.message,
    //         title: affiliateMessage.title
    //     })
    // }

    const user = await User.findOne({where: {id: userID}});
    const affiliateID = user.affiliateID;
    const clickResults = await DatabaseModel.awaitableQuery(`SELECT COUNT(*) as count FROM ${AffiliateClick.tableName()} WHERE userID = ?`, [userID]);
    const clicks = clickResults.length ? clickResults[0].count : 0;

    const registerResults = await DatabaseModel.awaitableQuery(`SELECT COUNT(*) as count FROM ${User.tableName()} WHERE affiliateRef = ?`, [affiliateID]);
    const registers = registerResults.length ? registerResults[0].count : 0;

    const commissionStatResults = await DatabaseModel.awaitableQuery(`
        SELECT SUM(Payment.amount) as commission,
            COUNT(DISTINCT Payment.userID) as conversions,
            SUM(IF(Payment.hasPaidAffiliate = 1, 0, Payment.amount)) as unpaidCommission
        FROM ${Payment.tableName()} as Payment
        JOIN ${User.tableName()} as User
            ON User.id = Payment.userID
        WHERE User.affiliateRef = ?
            AND User.affiliateRef != ""
    `, [affiliateID]);
    const commissionStats = commissionStatResults.length ? commissionStatResults[0] : {};

    const response = {
        affiliateID: affiliateID,
        paypal: user.affiliatePayPal,
        stats: {
            clicks: clicks,
            registers: registers, 
            conversions: commissionStats.conversions, 
            commissions: commissionStats.commission ? commissionStats.commission : 0, 
            unpaid: parseFloat((Math.floor((commissionStats.unpaidCommission * 0.3) * 100) / 100).toFixed(2))
        },
        banned: affiliateMessage?.type == AffiliateMessage.Type.BAN,
        message: affiliateMessage ? {
            body: affiliateMessage.message,
            title: affiliateMessage.title
        } : null
    }

    return res.status(200).json(response);
});

 /* We would use this if we don't want recurring commissions */
    /*
    const paymentsSubQuery = `
        SELECT fullPayments.*
        FROM ${Payment.tableName()} as fullPayments
        JOIN (
            SELECT MIN(Payment.created) as firstCreated, userID
            FROM ${Payment.tableName()} as Payment
            GROUP BY userID
        ) as orderedPayments
            ON fullPayments.userID = orderedPayments.userID AND fullPayments.created = orderedPayments.firstCreated
    `;
    */
   