import ApiHandler from '~/src/Services/ApiHandler';
import TikTokPostHandler from '~/src/Models/TikTokPostHandler';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    // Check TikTok for updates on the status of all videos that are uploading
    await TikTokPostHandler.checkPostStatus();

    res.status(200).json({success: true});
});