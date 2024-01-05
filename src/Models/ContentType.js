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
        JOKES: 'long form jokes',
        LIFE_PRO_TIP: 'life pro tip',
        ELI5: 'eli5',
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
                prompt: 'Write a captivating and complete short story in the style of r/shortstories.',
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
                prompt: `Write a short, highly motivational story or passage. It should get the reader pumped up and feel ambitious.

                Include an insanely MIND-BENDING opening hook.`,
                sample: `Sample story motivation`
            }),

            new ContentType({
                id: this.ID.BEDTIME_STORIES, 
                name: 'Bedtime Stories', 
                prompt: 'Write a short and complete bedtime story for children using a whimsical writing style.',
                sample: `Once upon a time, in Moonlight Meadow, a curious bunny named Buttercup went on a magical adventure. She hopped across a sparkling river and followed a path of twinkling fireflies. Along the way, she met a wise owl who shared stories of far-off lands. Buttercup encountered friendly woodland creatures and they all embarked on a quest to find the missing moonbeam. Together, they ventured through enchanted forests, climbed rainbows, and discovered hidden treasures. Finally, they found the moonbeam nestled among the stars, and with a sprinkle of fairy dust, the moonbeam returned to Moonlight Meadow, casting a gentle, calming glow upon the land.`
            }),

            new ContentType({
                id: this.ID.INTERESTING_HISTORY, 
                name: 'Interesting History', 
                prompt: 'Write about a highly interesting, but lesser-known historical event. It should all be factual, accurate, and real.',
                sample: `Unveiling the astonishing tale of the Dancing Plague of 1518, an enigmatic and lesser-known historical event that captivated the town of Strasbourg. Fueled by a mysterious fervor, hundreds of people found themselves compelled to dance uncontrollably for days on end, with many suffering exhaustion and even death. This bizarre phenomenon remains shrouded in mystery, with theories ranging from mass hysteria to poisoning. Unveil the extraordinary events that unfolded and explore the enduring questions surrounding this perplexing dance epidemic, an intriguing episode from history that has left historians and scientists alike bewildered.`
            }),

            new ContentType({
                id: this.ID.FUN_FACTS, 
                name: 'Fun Facts', 
                prompt: 'Choose an interesting fact and engagingly write about it. The goal is to make the reader smarter and more informed in an interesting and fun way!',
                sample: `Did you know that laughter can actually boost your immune system, relieve stress, and even burn calories? That’s right - laughing is not only fun, but also good for your health! Studies have shown that laughter releases endorphins, which are natural painkillers and mood boosters. So, the next time you're feeling down, try watching a funny video or sharing a joke with a friend. You might just improve your overall well-being!`
            }),

            new ContentType({
                id: this.ID.JOKES, 
                name: 'Long Form Jokes', 
                prompt: 'Write a long-form joke in the form of a short story.',
                sample: `Once upon a time in a small town, there was a talented juggler named Jack who could juggle anything. One day, a rich man heard about Jack's juggling skills and decided to test him. He threw a dozen eggs at Jack, challenging him to juggle them without breaking any. Jack accepted the challenge and flawlessly juggled the eggs, impressing everyone. But just as Jack caught the final egg, he accidentally dropped it. The rich man started laughing and said, "Well, Jack, looks like you couldn't handle the pressure!"`
            }),

            new ContentType({
                id: this.ID.LIFE_PRO_TIP, 
                name: 'Life Pro Tips', 
                prompt: 'Give a random useful life pro-tip. Fill your 100 words with an explanation of the tip.',
                sample: `Did you know that placing a wooden spoon over a pot can prevent it from boiling over? When water boils, the heat causes bubbles to form, and before you know it, there's a mess on your stovetop. But by simply resting a wooden spoon across the top of the pot, the bubbles are disrupted, preventing the boiling water from spilling over. The reason behind this handy trick is that the spoon's wooden handle doesn't conduct heat like metal does, so it cools the bubbles and keeps them from rising. Keep this pro-tip in mind for hassle-free cooking!`
            }),

            new ContentType({
                id: this.ID.ELI5, 
                name: 'ELI5', 
                prompt: 'Give a random ELI5 explanation of a random topic. Do not state the topic, simply begin with the explanation. The title can include the "ELI5: question".',
                sample: `Imagine you have a magic box that can send messages instantly to another magic box across the world. But instead of typing out the entire message, you can break it down into tiny pieces of information called packets. Each packet contains a small part of the message and has an address label on it. These packets then travel through a network of wires and routers to reach their destination. Once they arrive, the receiving magic box puts all the packets together in the correct order to reconstruct the original message. This is how information travels on the internet!`
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