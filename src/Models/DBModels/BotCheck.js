import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class BotCheck extends DatabaseModel {

    constructor({ userID, verified, verifiedTS, added }) {
        super();
        this.userID = userID;
		this.verified = verified;
		this.verifiedTS = verifiedTS;
		this.added = added;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new BotCheck(data);
    }

    static tableName() {
        return this.name;
    }

    /* ==== DB Helpers ==== */

    static async create({ userID }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (userID) VALUES (?)
            ON DUPLICATE KEY UPDATE 
            verified = 0,
            verifiedTS = NULL,
        `;
        const queryValues = [userID];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }

    static async markVerified({ userID }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (userID, verified, verifiedTS) VALUES (?, true, NOW())
            ON DUPLICATE KEY UPDATE 
            verified = VALUES(verified),
            verifiedTS = VALUES(verifiedTS)
        `;
        const queryValues = [userID];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }
}