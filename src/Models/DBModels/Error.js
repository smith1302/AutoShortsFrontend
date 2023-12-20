import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class Error extends DatabaseModel {

    constructor({ id, error, userID, created }) {
        super();
        this.id = id;
        this.error = error;
		this.userID = userID;
		this.created = created;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new Error(data);
    }

    static tableName() {
        return this.name;
    }

    /* ==== DB Helpers ==== */

    static async create({ error, name, userID }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (error, name, userID)
            VALUES
            (?, ?, ?)
        `;
        const queryValues = [error, name, userID];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }
}