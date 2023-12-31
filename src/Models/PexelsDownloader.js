import { createClient } from 'pexels';
import OpenAI from 'openai';
import axios from 'axios';
import {NodeSSH} from 'node-ssh';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import BackgroundVideo from './DBModels/BackgroundVideo';
import Embeddings from '~/src/Models/Embeddings';

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
            for (let i = 0; i < maxVideos; i++) {
                const video = videos[i];
                console.log(`Selected video: `, video.url);
                const description = await this.describeVideo(video);
                console.log(`Description: ${description}`);
                const filename = await this.downloadVideo(keyword, video);
                await this.saveToDatabase(filename, description);
                console.log(`------------------------`);
            }
        } catch (error) {
            console.error('Error in searchAndDownload:', error);
        }
    }

    async searchVideos(keyword) {
        const response = await this.client.videos.search({ query: keyword, orientation: 'portrait', per_page: 10 });
        return response.videos;
    }

    async describeVideo(video) {
        const allPictures = video.video_pictures;
        const maxPictures = Math.min(5, allPictures.length);
        // Get an even distribution of pictures
        const pictures = [];
        for (let i = 0; i < maxPictures; i++) {
            const index = Math.floor(i * allPictures.length / maxPictures);
            pictures.push(allPictures[index].picture);
        }

        const imageMessages = pictures.map(picture => {
            return {
                type: "image_url",
                image_url: {
                  "url": picture,
                },
              }
        });

        const response = await this.openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
            {
                role: 'system',
                content: 'You are video tagger. Your task is to read the frames from a video and provide a 1 to 10 word description. The description should only use words that help with search matching.'
            },
              {
                role: "user",
                content: [
                  { type: "text", text: "These are frames from a video. Provide a 1 to 10 word description of the video to help with matching searches." },
                  ...imageMessages,
                ],
              },
            ],
          });
          const content = response.choices[0].message.content;
          return content;
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
        await this.uploadFile(localPath, filename);

        return filename;
    }

    async uploadFile(localPath, filename) {
        console.log(`Uploading ${filename} to remote server...`);
        const ssh = new NodeSSH();

        try {
            await ssh.connect({
                host: 'autoshorts.ai',
                username: 'root',
                password: 'Azsxdcfv!234' // Use your SSH password
            });

            await ssh.putFile(localPath, `/var/www/html/storage/videos/backgrounds/${filename}`);
            console.log(`Uploaded ${filename} successfully.`);

            // Delete the local file
            fs.unlink(localPath, (err) => {
                if (err) {
                    console.error(`Failed to delete local file ${localPath}:`, err);
                } else {
                    console.log(`Deleted local file ${localPath}.`);
                }
            });
        } catch (error) {
            console.error('Failed to upload file:', error);
        } finally {
            ssh.dispose();
        }
    }

    async saveToDatabase(filename, description) {
        const embeddingHandler = new Embeddings();
        let embedding = await embeddingHandler.getEmbedding(description);
        embedding = JSON.stringify(embedding);
        await BackgroundVideo.create({ filename, description, embedding });
    }
}

// Usage
// const downloader = new PexelsDownloader();
// downloader.searchAndDownload('Nature');