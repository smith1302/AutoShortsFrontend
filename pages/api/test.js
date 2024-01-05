import ApiHandler from '~/src/Services/ApiHandler';
import PexelsDownloader from '~/src/Models/PexelsDownloader';
import BackgroundVideo from '~/src/Models/DBModels/BackgroundVideo';
import VideoDescriber from '~/src/Models/VideoDescriber';
import Embeddings from '~/src/Models/Embeddings';
import path from 'path';
import DigitalOceanSpacesUploader from '~/src/Models/DigitalOceanSpacesUploader';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

        // const describer = new VideoDescriber();
        // const description = await describer.describeVideo(`./test2.mp4`);
        // console.log(`Meme overlay: ${description}`);

    // const uploadNewBackgroundVideo = async (localPath) => {
    //     const filename = path.basename(localPath);
    //     console.log(`======= ${filename} =======`);

    //     // Get description
    //     const describer = new VideoDescriber();
    //     const description = await describer.describeVideo(localPath);
    //     console.log(`Description: ${description}`);

    //     // Upload to remote server
    //     const uploader = new DigitalOceanSpacesUploader();
    //     await uploader.uploadFile(localPath, filename, 'backgrounds');
    //     console.log(`Uploaded to remote server.`);

    //     // Get embedding
    //     const embeddingHandler = new Embeddings();
    //     let embedding = await embeddingHandler.getEmbedding(description);
    //     embedding = JSON.stringify(embedding);

    //     // Save to database
    //     await BackgroundVideo.create({ filename, description, embedding });
    //     console.log(`Saved to database.`);
    // }
    // await uploadNewBackgroundVideo('./ship1.mp4');

    // const downloader = new PexelsDownloader();
    // const searchTerms = [
    //     "Creepy",
    //     "Spooky"
    // ];
    // for (const term of searchTerms) {
    //     await downloader.searchAndDownload(term);
    // }

    res.status(200).json({success: true});
});