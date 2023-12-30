import ApiHandler from '~/src/Services/ApiHandler';
import VideoScheduler from '~/src/Models/VideoScheduler';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const videoScheduler = new VideoScheduler();
    await videoScheduler.batchScheduleVideos({limit: 1});

    res.status(200).json({success: true});
});