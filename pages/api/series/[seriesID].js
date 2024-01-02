import ApiHandler from '~/src/Services/ApiHandler';
import Video from '~/src/Models/DBModels/Video';
import Series from '~/src/Models/DBModels/Series';
import TikTokAuth from '~/src/Models/DBModels/TikTokAuth';


export default ApiHandler(true, async (req, res) => {
    if (req.method === 'GET') {
        return handleGET(req, res);
    } else if (req.method === 'PUT') {
        return handlePUT(req, res);
    } else if (req.method === 'DELETE') {
        return handleDELETE(req, res);
    } else {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
});

async function handleDELETE(req, res) {
    const userID = req.user.id;
    const seriesID = req.query.seriesID;

    if (!userID) throw new Error(`User ID is required.`);
    if (!seriesID) throw new Error(`Series ID is required.`);

    await Series.query(`
        DELETE FROM ${Series.tableName()}
        WHERE id = ? AND userID = ?
    `, [seriesID, userID]);

    // NOTE: A MYSQL trigger will delete all unposted videos associated with the series.

    return res.status(200).json({success:true});
}

async function handleGET(req, res) {
    const userID = req.user.id;
    const seriesID = req.query.seriesID;

    if (!userID) throw new Error(`User ID is required.`);
    if (!seriesID) throw new Error(`Series ID is required.`);
    
    const series = await Series.findOne({where: {userID: userID, id: seriesID}});
    
    const videos = await Video.find({where: {userID: userID, seriesID: seriesID}, orderBy: {fieldName: 'created', direction: 'DESC'}});

    let upcomingVideo = null;
    let videoHistory = [];
    if (videos.length > 0) {
        upcomingVideo = videos[0];
        videoHistory = videos.map(video => {
            return {
                id: video.id,
                title: video.title,
                postedDate: video.postedDate,
            }
        })
    }

    // Get the updated TikTok creator info
    const creatorInfo = await TikTokAuth.getCreatorInfo({openID: series.openID});

    return res.status(200).json({series, upcomingVideo, videoHistory, creatorInfo});
}

async function handlePUT(req, res) {
    const userID = req.user.id;
    const seriesID = req.query.seriesID;
    const {privacy, duetDisabled, stitchDisabled, commentDisabled, openID} = req.body;

    if (!userID) throw new Error(`User ID is required.`);
    if (!seriesID) throw new Error(`Series ID is required.`);

    await Series.query(`
        UPDATE ${Series.tableName()}
        SET 
            privacy = ?, 
            duetDisabled = ?, 
            stitchDisabled = ?,
            commentDisabled = ?,
            openID = ?
        WHERE id = ? AND userID = ?
    `, [privacy, duetDisabled, stitchDisabled, commentDisabled, openID, seriesID, userID]);

    return res.status(200).json({success:true});
}