import OpenAI from 'openai';
import paths from '~/src/paths';
import fs from 'fs';
import path from 'path';
import files from '~/src/Utils/files';
import ffmpeg from 'fluent-ffmpeg';

export default class Whisper {
    constructor() {
        this.openai = new OpenAI({apiKey: process.env.OPENAI_KEY});
    }

    async extractAudioFromVideo(videoPath, audioOutputPath) {
        files.createFolder(audioOutputPath);
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .toFormat('mp3')
                .on('end', () => resolve(audioOutputPath))
                .on('error', reject)
                .save(audioOutputPath);
        });
    };

    async getTranscriptionFromVideo(videoPath) {
        const audioPath = await this.extractAudioFromVideo(videoPath, `./${paths.temp}/extractedAudio.mp3`);
        return this.getTranscriptionFromAudio(audioPath);
    }

    async getTranscriptionFromAudio(audioPath) {
        let transcription = null;
        try {

            const response = await this.openai.audio.transcriptions.create({
                model: 'whisper-1',
                file: fs.createReadStream(audioPath),
            });
            transcription = response.text;
        } catch (error) {
            console.error('Error getting transcription from audio', error);
        } finally {
            fs.unlinkSync(audioPath);
        }
        return transcription;
    }
}
