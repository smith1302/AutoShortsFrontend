import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class AffiliateClick extends DatabaseModel {

    constructor({ id, userID, IP, created }) {
        super();
        this.id = id;
        this.userID = userID;
        this.IP = IP;
        this.created = created;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new AffiliateClick(data);
    }

    static tableName() {
        return "AffiliateClick";
    }

    /* ==== DB Helpers ==== */

    static async create({ userID, IP = '' }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (userID, IP)
            VALUES
            (?, ?)
        `;
        const queryValues = [userID, IP];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }
}