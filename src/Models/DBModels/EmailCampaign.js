import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class EmailCampaign extends DatabaseModel {

    constructor({ id, name, userID, sent }) {
        super();
        this.id = id;
        this.name = name;
        this.userID = userID;
        this.sent = sent;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new EmailCampaign({
            id: data.id,
            name: data.name,
            userID: data.userID,
            sent: data.sent
        });
    }

    static tableName() {
        return "EmailCampaign";
    }

    /* ==== DB Helpers ==== */

    static async create({ userID, name }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (userID, name)
            VALUES
            (?, ?)
        `;
        const queryValues = [userID, name];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }
}