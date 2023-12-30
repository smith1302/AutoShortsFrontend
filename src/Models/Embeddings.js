import OpenAI from 'openai';

export default class Embeddings {
    constructor() {
        this.openai = new OpenAI({apiKey: process.env.OPENAI_KEY});
    }

    async getEmbeddings(texts) {
        const response = await this.openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: texts,
        });
        return response.data.map(embedding => embedding.embedding);
    }

    async getEmbedding(text) {
        const response = await this.openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: text,
        });
        return response.data[0].embedding;
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
        const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        return similarity;
    }
}