import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

/* Feedback for cancelation */

export default class Feedback extends DatabaseModel {

    constructor({ id, feedback, userID, created }) {
        super();
        this.id = id;
        this.feedback = feedback;
        this.userID = userID;
        this.created = created;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new Feedback(data);
    }

    static tableName() {
        return this.name;
    }

    /* ==== DB Helpers ==== */

    static async create({ feedback, userID }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (feedback, userID)
            VALUES
            (?, ?)
        `;
        const queryValues = [feedback, userID];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }
}