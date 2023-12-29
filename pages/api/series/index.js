import ApiHandler from '~/src/Services/ApiHandler';
import Series from '~/src/Models/DBModels/Series';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;

    if (!userID) throw new Error(`User ID is required.`);
    
    const series = await Series.find({where: {userID: userID}, orderBy: {fieldName: 'created', direction: 'DESC'}});

    return res.status(200).json(series);
});