import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class Series extends DatabaseModel {

    constructor({ id, userID, contentTypeID, contentDetails, voiceID, created }) {
        super();
        this.id = id;
        this.userID = userID;
        this.contentTypeID = contentTypeID;
		this.contentDetails = contentDetails;
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

    static async create({ userID, contentTypeID, contentDetails, voiceID, created }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (userID, contentTypeID, contentDetails, voiceID, created)
            VALUES
            (?, ?, ?, ?, ?)
        `;
        const queryValues = [userID, contentTypeID, contentDetails, voiceID, created];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }
}