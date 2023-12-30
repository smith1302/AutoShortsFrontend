import ApiHandler from '~/src/Services/ApiHandler';
import PayPalService from '~/src/Services/PayPalService';
import SendGrid from '~/src/Models/SendGrid';
import PexelsDownloader from '~/src/Models/PexelsDownloader';
import TikTokPostHandler from '~/src/Models/TikTokPostHandler';
import BackgroundVideo from '~/src/Models/DBModels/BackgroundVideo';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    // await TikTokPostHandler.uploadPendingVideos();
    // await new Promise(resolve => setTimeout(resolve, 1000));
    // await TikTokPostHandler.checkPostStatus();

    // const downloader = new PexelsDownloader();
    // const searchTerms = [
    //     "Rainforest",
    //     "Skyline",
    //     "Workout",
    //     "Desert",
    //     "Drone",
    //     "Baking",
    //     "Theatre",
    //     "Basketball",
    //     "Aquarium",
    //     "Parade"
    // ];
    // for (const term of searchTerms) {
    //     await downloader.searchAndDownload(term);
    // }

    res.status(200).json({success: true});
});