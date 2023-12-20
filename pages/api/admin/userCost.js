import ApiHandler from '~/src/Services/ApiHandler';
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

    const sort = req.query.sort || 'profit';
    if (!['profit', 'revenue', 'wordsUsed', 'cost'].includes(sort)) {
        throw new Error(`Unapproved sort field: ${sort}`);
    }

    const direction = req.query.direction || 'DESC';
    if (!['DESC', 'ASC'].includes(direction)) {
        throw new Error(`Unapproved sort field: ${direction}`);
    }

    let query = `
        SELECT UserCost.*, (paymentSums.revenue) as revenue, (paymentSums.revenue - UserCost.cost) as profit, (UserCost.inputWords + UserCost.outputWords) as wordsUsed
        FROM UserCost
        JOIN (
            SELECT SUM(amount) as revenue, userID
            FROM Payment
            GROUP BY userID
            ) as paymentSums
        ON UserCost.userID = paymentSums.userID   
        ORDER BY ${sort} ${direction}
        LIMIT 20
    `;
    const costs = await DatabaseModel.awaitableQuery(query);

    return res.status(200).json({costs});
});