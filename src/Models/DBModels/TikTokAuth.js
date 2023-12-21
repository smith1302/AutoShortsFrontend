import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class TikTokAuth extends DatabaseModel {

    constructor({ userID, open_id, data }) {
        super();
        this.userID = userID;
		this.open_id = open_id;
		this.data = data;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new TikTokAuth(data);
    }

    static tableName() {
        return this.name;
    }

    /* ==== DB Helpers ==== */

    static async create({ userID, open_id, data }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (userID, open_id, data)
            VALUES
            (?, ?, ?)
        `;
        const queryValues = [userID, open_id, data];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }
}