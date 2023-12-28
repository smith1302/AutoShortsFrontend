import ApiHandler from '~/src/Services/ApiHandler';
import Video from '~/src/Models/DBModels/Video';
import Series from '~/src/Models/DBModels/Series';
import TikTokAuth from '~/src/Models/DBModels/TikTokAuth';


export default ApiHandler(true, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;
    const seriesID = req.query.seriesID;

    if (!userID) throw new Error(`User ID is required.`);
    if (!seriesID) throw new Error(`Series ID is required.`);
    
    const series = await Series.findOne({where: {userID: userID, id: seriesID}});
    // Grab the upcoming video
    const video = await Video.findOne({where: {userID: userID, seriesID: seriesID}, orderBy: {fieldName: 'created', direction: 'DESC'}});

    // Get the updated TikTok creator info
    const creatorInfo = await TikTokAuth.getCreatorInfo({openID: series.openID});

    return res.status(200).json({series, video, creatorInfo});
});