import ApiHandler from '~/src/Services/ApiHandler';
import Event from '~/src/Models/DBModels/Event';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'GET') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    
    if (!req.user.master) {
        return res.status(400).end(`Not authorized`);
    }

    const eventName = req.query.eventName;
    const events = await Event.awaitableQuery(`
        SELECT * 
        FROM ${Event.tableName()} 
        WHERE name = ? 
        ORDER BY created 
        DESC LIMIT 75
    `, [eventName]);
    // let filteredEvents = events.filter(e => {
    //     const data = JSON.parse(e.data);
    //     const isEnglish = data.lang == null || data.lang == "en";
    //     return isEnglish && data.formParams.length == "longer";
    // });

    return res.status(200).json({events: events});
});