import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';
import cache from '~/src/Utils/nodeCache';

export default class BackgroundVideo extends DatabaseModel {

    constructor({ filename, description, created }) {
        super();
        this.filename = filename;
        this.description = description;
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

    static async create({ filename, description }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (filename, description)
            VALUES
            (?, ?)
        `;
        const queryValues = [filename, description];
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
}