import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class TikTokAuth extends DatabaseModel {

    constructor({ userID, openID, data }) {
        super();
        this.userID = userID;
		this.openID = openID;
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

    static async create({ userID, openID, data }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (userID, openID, data)
            VALUES
            (?, ?, ?)
        `;
        const queryValues = [userID, openID, data];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }
}