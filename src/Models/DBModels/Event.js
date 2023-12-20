import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class Event extends DatabaseModel {

    constructor({ id, name, userID, data, cost, created }) {
        super();
        this.id = id;
        this.name = name;
        this.userID = userID;
        this.data = data;
        this.cost = cost;
        this.created = created;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new Event(data);
    }

    static tableName() {
        return "Event";
    }

    /* ==== DB Helpers ==== */

    static async create({ userID, name, data, cost = null }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (userID, name, data, cost)
            VALUES
            (?, ?, ?, ?)
        `;
        const queryValues = [userID, name, data, cost];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }
}