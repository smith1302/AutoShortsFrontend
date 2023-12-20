import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class Payment extends DatabaseModel {

    constructor({ id, amount, userID, source, sourceID, created }) {
        super();
        this.id = id;
        this.amount = amount;
        this.userID = userID;
        this.source = source;
        this.sourceID = sourceID;
        this.created = created;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new Payment({
            id: data.id,
            amount: data.amount,
            userID: data.userID,
            source: data.source,
            sourceID: data.sourceID,
            created: data.created,
        });
    }

    static tableName() {
        return "Payment";
    }

    /* ==== DB Helpers ==== */

    static async create({ amount, userID, source = null, sourceID = null }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (amount, userID, source, sourceID)
            VALUES
            (?, ?, ?, ?)
        `;
        const queryValues = [amount, userID, source, sourceID];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }
}