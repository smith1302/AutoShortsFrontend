import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class AuthConfirmCode extends DatabaseModel {

    constructor({ id, code, email, sent }) {
        super();
        this.id = id;
        this.code = code;
        this.email = email;
        this.sent = sent;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new AuthConfirmCode({
            id: data.id,
            code: data.code,
            email: data.email,
            sent: data.sent
        });
    }

    static tableName() {
        return "AuthConfirmCode";
    }

    /* ==== DB Helpers ==== */

    static async create({ email, code }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (email, code)
            VALUES
            (?, ?)
        `;
        const queryValues = [email, code];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }
}