import { createClient } from 'pexels';
import OpenAI from 'openai';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import BackgroundVideo from './DBModels/BackgroundVideo';
import Embeddings from '~/src/Models/Embeddings';
import DigitalOceanSpacesUploader from '~/src/Models/DigitalOceanSpacesUploader';
import VideoDescriber from '~/src/Models/VideoDescriber';

dotenv.config();

export default class PexelsDownloader {
    constructor() {
        this.client = createClient(process.env.PEXELS_API_KEY);
        this.openai = new OpenAI({apiKey: process.env.OPENAI_KEY});
    }

    async searchAndDownload(keyword) {
        try {
            const videos = await this.searchVideos(keyword);
            const maxVideos = Math.min(3, videos.length);
            let i = 0, uploadedVideos = 0;
            while (uploadedVideos < maxVideos && i < videos.length) {
                try {
                    const video = videos[i];
                    console.log(`Selected video: `, video.url);
                    const filename = await this.downloadVideo(keyword, video);
                    const description = await this.describeVideo(video);
                    console.log(`Description: ${description}`);
                    await this.saveToDatabase(filename, description);
                    console.log(`------------------------`);
                    uploadedVideos++;
                } catch (error) {
                    console.error('Error in searchAndDownload while loop:', error);
                }
                i++;
            }
        } catch (error) {
            console.error('Error in searchAndDownload:', error.message);
        }
    }

    async searchVideos(keyword) {
        const response = await this.client.videos.search({ query: keyword, orientation: 'portrait', per_page: 10 });
        const videos = response.videos.filter(video => {
            const meetsMinDuration = video.duration > 10;
            const aspectRatio = (video.width / video.height);
            const verticalVideo = 9 / 16;
            // Must be within 10% of vertical video aspect ratio
            const meetsAspectRatio = aspectRatio >= (verticalVideo * 0.9) && aspectRatio <= (verticalVideo * 1.1);
            return meetsMinDuration && meetsAspectRatio;
        });

        return videos;
    }

    async describeVideo(video) {
        const pictureUrls = video.video_pictures.map(picture => picture.picture);
        const describer = new VideoDescriber();
        return describer.describeImages(pictureUrls);
    }

    getVideoUrl(video) {
        const IDEAL_WIDTH = 720;
        let videoUrl = null;
        let minDiff = 999999;
        for (let i = 0; i < video.video_files.length; i++) {
            const videoWidth = video.video_files[i].width;
            const diff = Math.abs(videoWidth - IDEAL_WIDTH);
            if (diff >= 0 && diff < minDiff) {
                minDiff = diff;
                videoUrl = video.video_files[i].link;
            }
            if (videoWidth === IDEAL_WIDTH) {
                break;
            }
        }
        return videoUrl;
    }

    async downloadVideo(keyword, video) {
        console.log(`Downloading video ${video.id}...`);
        let videoUrl = this.getVideoUrl(video);
        const filename = `${keyword}_${path.basename(new URL(videoUrl).pathname)}`;
        const localPath = `./${filename}`;

        // Check if we already have the video
        const existingVideo = await BackgroundVideo.findOne({where: {filename: filename}});
        if (existingVideo) {
            throw new Error(`Video ${filename} already exists in database. Aborting.`);
        }

        // Download video
        const response = await axios.get(videoUrl, { responseType: 'stream' });
        const writer = fs.createWriteStream(localPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Upload to remote server
        const uploader = new DigitalOceanSpacesUploader();
        await uploader.uploadFile(localPath, filename, 'backgrounds');

        // Delete local file
        fs.unlinkSync(localPath);

        return filename;
    }

    async saveToDatabase(filename, description) {
        const embeddingHandler = new Embeddings();
        let embedding = await embeddingHandler.getEmbedding(description);
        embedding = JSON.stringify(embedding);
        await BackgroundVideo.create({ filename, description, embedding });
    }
}