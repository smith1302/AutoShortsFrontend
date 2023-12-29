import OpenAI from 'openai';
import BackgroundVideo from '~/src/Models/DBModels/BackgroundVideo';

export default class ScriptWriter {
    constructor() {
        this.openai = new OpenAI({apiKey: process.env.OPENAI_KEY});
    }

    async getSimilarBackgroundVideos(input) {
        let similarBackground = null;
        const backgroundVideos = await BackgroundVideo.getAll();
        try {
            const descriptions = backgroundVideos.map(video => video.description);
            const userInputEmbedding = await this.getEmbeddings([input]);
            const descriptionEmbeddings = await this.getEmbeddings(descriptions);

            const similarities = descriptionEmbeddings.map((descEmbedding) =>
                this.cosineSimilarity(userInputEmbedding[0], descEmbedding)
            );

            const mostSimilarIndex = similarities.indexOf(Math.max(...similarities));
            const mostSimilarDescription = descriptions[mostSimilarIndex];
            similarBackground = backgroundVideos[mostSimilarIndex];

            console.log("Most similar background:");
            console.log(similarBackground);
        } catch (error) {
            console.error("Error:", error);
            similarBackground = this.getRandBackgroundVideo(backgroundVideos);
        }

        return similarBackground;
    }

    async getEmbeddings(texts) {
        const response = await this.openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: texts,
        });
        return response.data.map(embedding => embedding.embedding);
    }

    cosineSimilarity(a, b) {
        let dotProduct = 0.0;
        let normA = 0.0;
        let normB = 0.0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += Math.pow(a[i], 2);
            normB += Math.pow(b[i], 2);
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    async writeScript({basePrompt}) {
        let content;
        try {

            const prompt =`Please write me a video script for the topic below. It should include a strong hook.

            TOPIC:
            ${basePrompt.substring(0, 2000)}

            > OUTPUT FORMAT:
            Provide your response in JSON format as shown below. ONLY OUTPUT THE JSON. DO NOT INCLUDE ANYTHING ELSE IN YOUR RESPONSE.
            {
                "title": "...",
                "script": "...",
                "caption": "[A short caption for the video. Include 3-5 relevant hashtags.]"
            }`;

            const backgroundVideos = await BackgroundVideo.getAll();
            const formattedBackgroundVideos = JSON.stringify(backgroundVideos.map(video => {return {filename: video.filename, desc: video.description}}));

            const prompt2 = `# Objective: Develop comprehensive text content for faceless videos.

            # Content Requirements:
            
            Script: Craft a script suitable for a voiceover. Duration should be approximately 30-45 seconds when read aloud. The script should be formatted to be read aloud, so do not include hashtags, emojis, or other text that would not be spoken. The script should include a strong hook.
            Caption: Create a concise caption for the video, ideally one sentence. Include 3-5 relevant hashtags to enhance social media engagement.
            Title: Devise a compelling title for the video, limited to 10 words or fewer.
            
            # Theme: ${basePrompt.substring(0, 2000)}
            
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
                        content: 'You are a voiceover script writer for short form video content. Your task is to write voiceover scripts for 30-45 second videos. The scripts should only include spoken words - no hashtags or emojis.'
                    },
                    {
                        role: 'user',
                        content: prompt2
                    }
                ],
                max_tokens: 4000,
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
            jsonContent.background = await this.getSimilarBackgroundVideos(jsonContent.script);
            
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

    async writeEcomScript({productName, productDescription, price = null}) {
        const adjectiveList = ["exceptionally", "insanely", "extremely", "very", "somewhat", "a little bit", ""];
        const receivingAdjectiveList = ["general", "open-ended", "specific", "focused"];
        const receivingAdjective = receivingAdjectiveList[Math.floor(Math.random() * receivingAdjectiveList.length)];
        const adjective = adjectiveList[Math.floor(Math.random() * adjectiveList.length)];
        const specificity = `${adjective} ${receivingAdjective}`;
        try {
            const prompt =`You are a creative scriptwriter tasked with generating fresh and engaging content for a viral TikTok series. Each episode of the series features a short video where we are replying to comment in order to promote our product.
            
            Product Overview:
            - NAME: ${productName}
            - DESCRIPTION: ${productDescription}
            ${price ? `- PRICE: ${price}` : ``}
            
            Task:
            Generate a script for today's episode that includes a comment and an reply script that promotes the product. 
            - The comment can be anything from a general statement that allows us to jump in and promote the product, to a very specific question about the product's features. For today's episode, we want the comment to be ${specificity} and 10 words or less.
            - Your answer should be informative, less than 60 words, and simply talks about the product. DO NOT include hashtags.
            
            Output Format:
            Provide your response in JSON format as shown below. ONLY OUTPUT THE JSON. DO NOT INCLUDE ANYTHING ELSE IN YOUR RESPONSE.
            {
                "userQuestion": "[User comment. 10 words MAX. No hashtags.]",
                "script": "[Reply. 60 words MAX. No hashtags.]",
                "caption"; "[A short caption for the video. Include 3-5 relevant hashtags.]"
            }

            IMPORTANT: Don't try to push anyone into buying it, just talk about the product and its features. People on TikTok hate to be sold to, so keep it informative and engaging. Phrases like "check it out" or "buy it now" are the furthest from what I want.
            `;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a viral TikTok creator. Your job is to create a short, 10 second script for a faceless TikTok video series that promotes a product.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 3000,
                temperature: 1
            });

            let content = response.choices[0].message.content;
            content = content.replace(/.*\[/, "[");
            content = content.replace("```json", "");
            content = content.replace("```json\n", "");
            content = content.replace("```", "");

            const jsonContent = JSON.parse(content);
            // Remove any hashtags from jsonContent.script, just incase
            jsonContent.script = jsonContent.script.replace(/#[^\s]+/g, "");
            
            return jsonContent
        } catch (error) {
            console.error('Error getting ScriptWriter:', error);
            return null;
        }
    }
}
