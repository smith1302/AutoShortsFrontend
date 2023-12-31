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
            const prompt = `${basePrompt.substring(0, 2000)}
            
            It must be 80 to 100 words`;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo-1106',
                messages: [
                    {
                        role: 'system',
                        content: `Your text will be used as narration over a video background on social media platforms. So, you should include strong hooks to stop viewers from scrolling.

                        Your output must be in JSON format that includes the following keys: "content", "title", "caption".
                        
                        - Content: The text that you generate based on the user's message. It must be 80 to 100 words. Never include hashtags in your content.
                        
                        - Title: A title suitable for a video based off your content. It should be 10 words or less.
                        
                        - Caption: A social media caption based off your content. You should include 3 to 5 relevant hashtags.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 3000,
                temperature: 1,
                response_format: { type: "json_object" },
            });

            content = response.choices[0].message.content;
            content = content.replace(/.*\[/, "[");
            content = content.replace("```json", "");
            content = content.replace("```json\n", "");
            content = content.replace("```", "");
            // console.log(content);

            const jsonContent = JSON.parse(content);
            jsonContent.script = jsonContent.content;
            // Remove json.Content
            delete jsonContent.content;
            // Remove any hashtags from jsonContent.script, just incase
            jsonContent.script = jsonContent.script.replace(/#[^\s]+/g, "");
            // Remove beginning and trailing whitespace from jsonContent.script
            jsonContent.script = jsonContent.script.trim();
             const similarBackgroundVideo = await this.getSimilarBackgroundVideos(jsonContent.script);
            jsonContent.background = similarBackgroundVideo.filename;
            
            return jsonContent
        } catch (error) {
            console.error('Error getting ScriptWriter:', error);
            console.log("Content:");
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
