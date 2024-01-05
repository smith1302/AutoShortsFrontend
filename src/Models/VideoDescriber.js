import paths from '~/src/paths';
import files from '~/src/Utils/files';
import OpenAI from 'openai';
import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type'
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

export default class VideoDescriber {
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
    }

    async extractFrames({ fps = 0.5, filePath, outputDir }) {
        return new Promise((resolve, reject) => {
            files.createFolder(outputDir);

            ffmpeg(filePath)
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
                .output(`${outputDir}/frame-%03d.png`)
                .outputOptions([
                    `-vf fps=${fps},drawtext=text=\'%{pts\\:gmtime\\:0\\:%T}\':x=(w-tw)-10:y=(h-th)-10:fontcolor=red:fontsize=24`
                ])
                .run();
        });
    }

    async encodedImageToBase64(imagePath) {
        const buffer = fs.readFileSync(imagePath);
        const type = await fileTypeFromBuffer(buffer);
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType = type ? type.mime : 'image/png';
        return `data:${mimeType};base64,${base64}`;
    }

    async getImageUrls(frameDir) {
        const fileNames = fs.readdirSync(frameDir);
        const base64ImagePromises = fileNames.map(fileName => {
            const filePath = path.join(frameDir, fileName);
            return this.encodedImageToBase64(filePath);
        });
        return await Promise.all(base64ImagePromises);
    }

    async describeVideo(videoPath) {
        const frameDir = `${paths.temp}/frames`;
        await this.extractFrames({ fps: 1, filePath: videoPath, outputDir: frameDir });
        const imageUrls = await this.getImageUrls(frameDir);
        const description = await this.describeImages(imageUrls);
        fs.rmdirSync(frameDir, { recursive: true });
        return description;
    }

    async describeImages(imageUrls, quality = 'low') {
        // Get an even distribution of images
        const maxImageUrls = Math.min(7, imageUrls.length);
        const filteredImageUrls = [];
        for (let i = 0; i < maxImageUrls; i++) {
            const index = Math.floor(i * imageUrls.length / maxImageUrls);
            filteredImageUrls.push(imageUrls[index]);
        }

        const imageMessages = filteredImageUrls.map(imageUrl => {
            return {
                type: "image_url",
                image_url: {
                    "url": imageUrl,
                    detail: quality
                },
            }
        });

        const response = await this.openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
            {
                role: 'system',
                content: 'You are video tagger. Your task is to read the frames from a video and provide a 1 to 15 word description. The description should only use words that help with search matching. Try to include an emotion you feel when watching the video.'
            },
              {
                role: "user",
                content: [
                  { type: "text", text: "These are frames from a video. Provide a 1 to 15 word description of the video to help with matching searches." },
                  ...imageMessages,
                ],
              },
            ],
            max_tokens: 400,
          });
        const content = response.choices[0].message.content;
        return content;
    }

}