export default class ContentType {
    constructor({id, name, prompt, editable = false, editPlaceholder = '', editLabel, maxPromptLength = 2000, sample = ''}) {
        this.id = id;
        this.name = name;
        this.prompt = prompt;
        this.editable = editable;
        this.editPlaceholder = editPlaceholder;
        this.editLabel = editLabel;
        this.maxPromptLength = maxPromptLength;
        this.sample = sample;
        this.metadata = {};
    }

    setPrompt(prompt) {
        this.prompt = prompt.substring(0, this.maxPromptLength);
    }

    hasSufficientInformation() {
        return this.prompt.length > 1;
    }

    static ID = {
        RANDOM_AI_STORY: 'random ai story',
        SCARY_STORIES: 'scary stories',
        MOTIVATIONAL_STORIES: 'motivational stories',
        BEDTIME_STORIES: 'bedtime stories',
        INTERESTING_HISTORY: 'interesting history',
        FUN_FACTS: 'fun facts',
        SHOPIFY_PRODUCT_PROMOTION: 'shopify product promotion',
        CUSTOM: 'custom'
    }

    static find(id) {
        return this.all().find(contentType => contentType.id == id);
    }

    static all() {
        return [
            new ContentType({
                id: this.ID.RANDOM_AI_STORY, 
                name: 'Random AI Story', 
                prompt: 'Write me a short story about a random topic',
                sample: `Once there was a small village hidden in a lush valley, surrounded by towering mountains. In this village lived a young boy named Milo, who had a unique gift – he could talk to animals. Every day, Milo would venture into the forest, chatting with birds, laughing with rabbits, and learning secrets from the wise old owl.

                One day, a fierce dragon appeared, terrifying the villagers. But Milo, with his courage and unique ability, approached the dragon. He discovered that the dragon was not fierce but lonely. Milo promised to visit the dragon every day.
                
                From that day on, Milo and the dragon became the best of friends, and the village was never threatened again. The villagers learned a valuable lesson about understanding and kindness, all thanks to a brave boy who could talk to animals.`
            }),

            new ContentType({
                id: this.ID.SCARY_STORIES, 
                name: 'Scary Stories', 
                prompt: `"Write me a horror story with a big reveal at the end that won't let me sleep tonight in the style of reddit /r/nosleep."`,
                sample: 'He could hear the sound of heavy footsteps approaching. They were getting closer and closer. He knew that if he didn’t run now, he would die. He turned around and saw a tall, dark figure standing in the shadows. He ran as fast as he could, but the figure was faster. It grabbed him by the neck and lifted him off the ground. He tried to scream, but the figure’s hand was covering his mouth. He struggled to get free, but it was no use. He was going to die.'
            }),

            new ContentType({
                id: this.ID.MOTIVATIONAL_STORIES, 
                name: 'Motivational Stories', 
                prompt: '"Write a short, motivational story in the style of reddit /r/getmotivated."',
                sample: `Sample story motivation`
            }),

            new ContentType({
                id: this.ID.BEDTIME_STORIES, 
                name: 'Bedtime Stories', 
                prompt: '"Create a soothing bedtime story for children, featuring gentle adventure and whimsical characters, ending with a calming, peaceful resolution."',
                sample: `Once upon a time, in Moonlight Meadow, a curious bunny named Buttercup went on a magical adventure. She hopped across a sparkling river and followed a path of twinkling fireflies. Along the way, she met a wise owl who shared stories of far-off lands. Buttercup encountered friendly woodland creatures and they all embarked on a quest to find the missing moonbeam. Together, they ventured through enchanted forests, climbed rainbows, and discovered hidden treasures. Finally, they found the moonbeam nestled among the stars, and with a sprinkle of fairy dust, the moonbeam returned to Moonlight Meadow, casting a gentle, calming glow upon the land.`
            }),

            new ContentType({
                id: this.ID.INTERESTING_HISTORY, 
                name: 'Interesting History', 
                prompt: '"Compose a short, informative video script about a real historical event that is lesser known but very interesting. It should all be factual, accurate, and real."',
                sample: `In the early 20th century, an American explorer named Hiram Bingham stumbled upon the astonishing remains of an ancient Incan city hidden high in the Peruvian Andes. This city, known as Machu Picchu, had been abandoned for centuries and its existence was largely unknown to the outside world. With its intricate stone architecture and breathtaking location, Machu Picchu is now recognized as a UNESCO World Heritage site and remains one of the most captivating destinations on Earth.`
            }),

            new ContentType({
                id: this.ID.FUN_FACTS, 
                name: 'Fun Facts', 
                prompt: '"Compose a short, informative video script about a specific tip, fact, topic, or event that everyone should know. It should be informative and helpful with a humorous tone to captivate a general audience."',
                sample: `
                Did you know that laughter can actually boost your immune system, relieve stress, and even burn calories? That’s right - laughing is not only fun, but also good for your health! Studies have shown that laughter releases endorphins, which are natural painkillers and mood boosters. So, the next time you're feeling down, try watching a funny video or sharing a joke with a friend. You might just improve your overall well-being!`
            }),

            // new ContentType({
            //     id: this.ID.SHOPIFY_PRODUCT_PROMOTION, 
            //     name: 'Shopify Product Promotion', 
            //     prompt: '', 
            //     editable: true, 
            //     editPlaceholder: "Enter details about your product here.", 
            //     editLabel: "Product Details", 
            //     maxPromptLength: 1000,
            // }),

            new ContentType({
                id: this.ID.CUSTOM, 
                name: 'Custom', 
                prompt: '', 
                editable: true, 
                editPlaceholder: "Example: Write about an interesting, factual event that occured in history that most people do not know about. Keep it short and engaging, in the style of a story.", 
                editLabel: "Custom Prompt",
                maxPromptLength: 200,
            })
        ]
    }
}