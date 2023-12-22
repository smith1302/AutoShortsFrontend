import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class Series extends DatabaseModel {

    constructor({ id, title, userID, openID, contentTypeID, prompt, voiceID, created }) {
        super();
        this.id = id;
        this.title = title;
        this.userID = userID;
        this.openID = openID;
        this.contentTypeID = contentTypeID;
		this.prompt = prompt;
		this.voiceID = voiceID;
		this.created = created;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new Series(data);
    }

    static tableName() {
        return this.name;
    }

    /* ==== DB Helpers ==== */

    static async create({ title, userID, openID, contentTypeID, prompt, voiceID, created }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (userID, title, openID, contentTypeID, prompt, voiceID, created)
            VALUES
            (?, ?, ?, ?, ?, ?, ?)
        `;
        const queryValues = [title, userID, openID, contentTypeID, prompt, voiceID, created];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }
}