import ApiHandler from '~/src/Services/ApiHandler';
import Event from '~/src/Models/DBModels/Event';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'GET') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    
    if (!req.user.master) {
        return res.status(400).end(`Not authorized`);
    }

    const events = await Event.awaitableQuery(`SELECT name, COUNT(*) as num FROM ${Event.tableName()} WHERE created > NOW() - INTERVAL 1 WEEK GROUP BY name ORDER BY num DESC`);
    return res.status(200).json({events});
});