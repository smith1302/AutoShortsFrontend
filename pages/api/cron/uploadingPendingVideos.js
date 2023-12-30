import ApiHandler from '~/src/Services/ApiHandler';
import TikTokPostHandler from '~/src/Models/TikTokPostHandler';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    // Upload all videos that are scheduled to be uploaded
    await TikTokPostHandler.uploadPendingVideos();

    res.status(200).json({success: true});
});