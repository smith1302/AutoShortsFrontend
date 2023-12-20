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

    static ID = {
        RANDOM_AI_STORY: 'random ai story',
        SCARY_STORIES: 'scary stories',
        MOTIVATIONAL_STORIES: 'motivational stories',
        BEDTIME_STORIES: 'bedtime stories',
        INTERESTING_HISTORY: 'interesting history',
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
                prompt: 'Write me a short scary story',
                sample: 'He could hear the sound of heavy footsteps approaching. They were getting closer and closer. He knew that if he didn’t run now, he would die. He turned around and saw a tall, dark figure standing in the shadows. He ran as fast as he could, but the figure was faster. It grabbed him by the neck and lifted him off the ground. He tried to scream, but the figure’s hand was covering his mouth. He struggled to get free, but it was no use. He was going to die.'
            }),

            new ContentType({
                id: this.ID.MOTIVATIONAL_STORIES, 
                name: 'Motivational Stories', 
                prompt: 'Write me a short motivational story',
                sample: 'Sample story motivation'
            }),

            new ContentType({
                id: this.ID.BEDTIME_STORIES, 
                name: 'Bedtime Stories', 
                prompt: 'Write me a short bedtime story',
                sample: 'Sample story bedtime'
            }),

            new ContentType({
                id: this.ID.INTERESTING_HISTORY, 
                name: 'Interesting History', 
                prompt: 'Write me a short interesting history',
                sample: 'Sample story history'
            }),

            new ContentType({
                id: this.ID.SHOPIFY_PRODUCT_PROMOTION, 
                name: 'Shopify Product Promotion', 
                prompt: '', 
                editable: true, 
                editPlaceholder: "Enter details about your product here.", 
                editLabel: "Product Details", 
                maxPromptLength: 1000,
                sample: 'Sample story shopify'
            }),

            new ContentType({
                id: this.ID.CUSTOM, 
                name: 'Custom', 
                prompt: '', 
                editable: true, 
                editPlaceholder: "Example: Write about an interesting, factual event that occured in history that most people do not know about. Keep it short and engaging, in the style of a story.", 
                editLabel: "Custom Prompt",
                maxPromptLength: 200,
                sample: 'Sample story custom'
            })
        ]
    }
}