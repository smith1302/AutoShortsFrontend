import OpenAI from 'openai';
import BackgroundVideo from '~/src/Models/DBModels/BackgroundVideo';
import Embeddings from '~/src/Models/Embeddings';

export default class ScriptWriter {
    constructor() {
        this.openai = new OpenAI({apiKey: process.env.OPENAI_KEY});
        this.embeddingHandler = new Embeddings();
    }

    async getSimilarBackgroundVideos(input) {
        let similarBackground = null;
        const backgroundVideos = await BackgroundVideo.getAll();
        try {
            const inputEmbedding = await this.embeddingHandler.getEmbedding(input);
            const descriptionEmbeddings = backgroundVideos.map(video => JSON.parse(video.embedding));
            const similarities = descriptionEmbeddings.map((descEmbedding) =>
                this.embeddingHandler.cosineSimilarity(inputEmbedding, descEmbedding)
            );
            const mostSimilarIndex = similarities.indexOf(Math.max(...similarities));
            similarBackground = backgroundVideos[mostSimilarIndex];
        } catch (error) {
            console.error("Error in getSimilarBackgroundVideos:", error);
            similarBackground = this.getRandBackgroundVideo(backgroundVideos);
        }

        return similarBackground;
    }

    async writeScript({basePrompt}) {
        let content;
        try {
            const prompt = `# Objective: Write a comprehensive piece of text on the video theme.

            # Content Requirements:
            
            Script: Duration should be approximately 30-45 seconds when read aloud. The text should be formatted to be read aloud, so do not include hashtags, emojis, or other text that would not be spoken. The text should include a strong hook and should be engaging and casual, as if you were speaking to a friend.
            Caption: Create a concise caption for the video, ideally one sentence. Include 3-5 relevant hashtags to enhance social media engagement.
            Title: Devise a compelling title for the video, limited to 10 words or fewer.
            
            # Video Theme: ${basePrompt.substring(0, 2000)}
            
            # OUTPUT FORMAT:
            Provide your response in JSON format as shown below. ONLY OUTPUT THE JSON. DO NOT INCLUDE ANYTHING ELSE IN YOUR RESPONSE.
            {
                "title": "...",
                "script": "...",
                "caption": "..."
            }`

            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You write short content that is read aloud in a video. It should be comprehensive, engaging, and casual.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 3000,
                temperature: 1
            });

            content = response.choices[0].message.content;
            content = content.replace(/.*\[/, "[");
            content = content.replace("```json", "");
            content = content.replace("```json\n", "");
            content = content.replace("```", "");
            // console.log(content);

            const jsonContent = JSON.parse(content);
            // Remove any hashtags from jsonContent.script, just incase
            jsonContent.script = jsonContent.script.replace(/#[^\s]+/g, "");
            // Remove beginning and trailing whitespace from jsonContent.script
            jsonContent.script = jsonContent.script.trim();
             const similarBackgroundVideo = await this.getSimilarBackgroundVideos(jsonContent.script);
            jsonContent.background = similarBackgroundVideo.filename;
            
            return jsonContent
        } catch (error) {
            console.error('Error getting ScriptWriter:', error);
            console.log("Conent:");
            console.log(content);
            return null;
        }
    }

    isValidBackgroundVideoName = (backgroundVideos, name) => {
        return backgroundVideos.some(video => video.filename === name);
    }

    getRandBackgroundVideo = (backgroundVideos) => {
        return backgroundVideos[Math.floor(Math.random() * backgroundVideos.length)];
    }
}
