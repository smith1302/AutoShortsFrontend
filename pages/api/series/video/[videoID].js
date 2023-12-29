import ApiHandler from '~/src/Services/ApiHandler';
import Video from '~/src/Models/DBModels/Video';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'PUT') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;
    const videoID = req.query.videoID;
    const {title, caption, script} = req.body;

    if (!userID) throw new Error(`User ID is required.`);
    if (!videoID) throw new Error(`Video ID is required.`);
    if (!title) throw new Error(`Title is required.`);
    if (!caption) throw new Error(`Caption is required.`);
    if (!script) throw new Error(`Script is required.`);

    const existingVideo = await Video.findOne({where: {id: videoID}});
    const requiresNewRender = existingVideo.requiresNewRender({title, caption, script});
    
    if (requiresNewRender) {
        const query = `
            UPDATE ${Video.tableName()}
            SET 
                title = ?, 
                caption = ?, 
                script = ?,
                videoUrl = NULL,
                jobID = NULL,
                pendingCreation = 1,
                updated = NOW()
            WHERE id = ? AND userID = ?
        `;
        const queryValues = [title, caption, script, videoID, userID];
        const response = await Video.query(query, queryValues);
        if (response.affectedRows === 0) throw new Error(`Error updating video ${videoID} for user ${userID}.`);
    }

    return res.status(200).json({success:true});
});