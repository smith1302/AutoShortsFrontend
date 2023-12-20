import ApiHandler from '~/src/Services/ApiHandler';
import Event from '~/src/Models/DBModels/Event';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user?.id;
    let page = Math.max(0, parseInt(req.query.page || 1));
    const eventsPerPage = 10;

    const commonSQL = `
        FROM ${Event.tableName()}
        WHERE data LIKE '%formParams%' 
        AND userID = ?
    `;

    const eventCount = await Event.awaitableQuery(`
        SELECT COUNT(*) as numEvents 
        ${commonSQL}
    `, [userID]);
    const numEvents = eventCount.length > 0 ? eventCount[0].numEvents : 0;
    const totalPages = Math.ceil(numEvents / eventsPerPage);

    page = Math.max(1, Math.min(page, totalPages));

    const events = await Event.awaitableQuery(`
        SELECT *
        ${commonSQL}
        ORDER BY created DESC
        LIMIT ?, ?
    `, [userID, (page - 1) * eventsPerPage, eventsPerPage]);

    return res.status(200).json({events, totalPages, currentPage: page});
});