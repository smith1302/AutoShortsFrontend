import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';
import Embeddings from '~/src/Models/Embeddings';
import cache from '~/src/Utils/nodeCache';
import paths from '~/src/paths';
import VideoDescriber from '~/src/Models/VideoDescriber';

export default class BackgroundVideo extends DatabaseModel {

    constructor({ filename, description, embedding, created }) {
        super();
        this.filename = filename;
        this.url = `${paths.backgroundVideos}/${filename}`;
        this.description = description;
        this.embedding = embedding;
        this.created = created;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new BackgroundVideo(data);
    }

    static tableName() {
        return this.name;
    }

    /* ==== DB Helpers ==== */

    async updateEmbedding() {
        const embeddingHandler = new Embeddings();
        const embedding = await embeddingHandler.getEmbedding(this.description);
        console.log(`FileName: ${this.filename}`);
        const query = `
            UPDATE ${BackgroundVideo.tableName()}
            SET embedding = ?
            WHERE filename = ?
        `;
        const queryValues = [JSON.stringify(embedding), this.filename];
        await BackgroundVideo.query(query, queryValues);
    }

    static async makeNewDescriptions() {
        const describer = new VideoDescriber();
        const embeddingHandler = new Embeddings();
        const videos = await BackgroundVideo.getAll();

        for (const video of videos) {
            continue;

            const description = await describer.describeVideo(video.url);
            const embedding = await embeddingHandler.getEmbedding(description);

            console.log(`======= ${video.filename} (${video.url}) =======`);
            console.log(`Description: ${description}`);
            await BackgroundVideo.query(`
                UPDATE ${BackgroundVideo.tableName()}
                SET embedding = ?, description = ?
                WHERE filename = ?
            `, [JSON.stringify(embedding), description, video.filename]);
        }
    }

    static async create({ filename, description, embedding }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (filename, description, embedding)
            VALUES
            (?, ?, ?)
        `;
        const queryValues = [filename, description, embedding];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }

    static async getAll() {
        const cacheKey = `BackgroundVideo.getAll`;
        let allModels = cache.get(cacheKey);
        if (!allModels) {
            const query = `
                SELECT *
                FROM ${this.tableName()}
            `;
            allModels = this.query(query);
            cache.set(cacheKey, allModels, 60 * 60);
        }
        return allModels;
    }

    static async updateMissingEmbeddings() {
        const query = `
            SELECT *
            FROM ${this.tableName()}
            WHERE embedding IS NULL
        `;
        const videos = await this.query(query);
        for (const video of videos) {
            await video.updateEmbedding();
        }
    }
}