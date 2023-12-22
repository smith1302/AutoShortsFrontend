import OpenAI from 'openai';

export default class ScriptWriter {
    constructor() {
        this.openai = new OpenAI({apiKey: process.env.OPENAI_KEY});
    }

    async writeScript({basePrompt}) {
        try {
            // const prompt =`Our app automatically creates and posts daily TikTok videos on behalf of our customers. The customers simply provide a basic prompt for the type of content they want, and we use that to generate videos. Your role is to act as our expert scriptwriter for viral short form video content. Below is the prompt that our customer provided us for their series of video content.

            // > PROMPT:
            // ${basePrompt.substring(0, 2000)}
            
            // > TASK:
            // - Generate a script for today's video that includes a title to display at the beginning of the video. 

            // > UNBREAKABLE RULES:
            // - The script MUST be between 40-60 words, no more and no less. DO NOT include hashtags.
            // - The title must be 10 words or less.
            // - In the event that there are any conflicts between the prompt and the task rules, ALWAYS prioritize the task rules.
                        
            // > OUTPUT FORMAT:
            // Provide your response in JSON format as shown below. ONLY OUTPUT THE JSON. DO NOT INCLUDE ANYTHING ELSE IN YOUR RESPONSE.
            // {
            //     "title": "[10 words max]",
            //     "script": "[40-60 words]",
            //     "caption": "[A short caption for the video. Include 3-5 relevant hashtags.]"
            // }`;

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

            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a voiceover script writer for short form video content. Your task is to write voiceover scripts for 30-45 second videos. The scripts should only include spoken words - no hashtags or emojis.'
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
            // console.log(content);

            const jsonContent = JSON.parse(content);
            // Remove any hashtags from jsonContent.script, just incase
            jsonContent.script = jsonContent.script.replace(/#[^\s]+/g, "");
            
            return jsonContent
        } catch (error) {
            console.error('Error getting ScriptWriter:', error);
            return null;
        }
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
