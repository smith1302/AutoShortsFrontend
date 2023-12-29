import ApiHandler from '~/src/Services/ApiHandler';
import PayPalService from '~/src/Services/PayPalService';
import SendGrid from '~/src/Models/SendGrid';
import PexelsDownloader from '~/src/Models/PexelsDownloader';
import ScriptWriter from '~/src/Models/ScriptWriter';
import BackgroundVideo from '~/src/Models/DBModels/BackgroundVideo';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const scriptWriter = new ScriptWriter();
    const desc = await scriptWriter.getSimilarBackgroundVideos(`Did you know that the Ancient Roman Empire lasted for over a thousand years? It was one of the largest and most powerful empires in history. From its humble beginnings in 753 BC to its eventual downfall in 476 AD, the Romans expanded their territory through military conquest and political alliances. They built magnificent structures like the Colosseum and aqueducts that still stand today, showcasing their advanced engineering skills. However, internal conflicts, corruption, and external invasions eventually weakened the empire, leading to its decline. The fall of the Roman Empire marked the beginning of the Middle Ages. Incredible.`);

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