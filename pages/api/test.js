import ApiHandler from '~/src/Services/ApiHandler';
import PayPalService from '~/src/Services/PayPalService';
import SendGrid from '~/src/Models/SendGrid';
import PexelsDownloader from '~/src/Models/PexelsDownloader';
import TikTokPostHandler from '~/src/Models/TikTokPostHandler';
import VideoScheduler from '~/src/Models/VideoScheduler';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    // const videoScheduler = new VideoScheduler();
    // await videoScheduler.updateScheduledVideosForUser({userID: 1});
    // await videoScheduler.batchScheduleVideos({limit: 1});

    // const downloader = new PexelsDownloader();
    // const searchTerms = [
    //     "Fantasy",
    //     "Whimsical"
    // ];
    // for (const term of searchTerms) {
    //     await downloader.searchAndDownload(term);
    // }

    res.status(200).json({success: true});
});