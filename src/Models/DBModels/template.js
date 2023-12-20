import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class $TABLE_NAME extends DatabaseModel {

    constructor({ id$PARAM_LIST }) {
        super();
        this.id = id;
        $PARAM_ASSIGNMENT
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new $TABLE_NAME(data);
    }

    static tableName() {
        return this.name;
    }

    /* ==== DB Helpers ==== */

    static async create({ id$PARAM_LIST }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (id$PARAM_LIST)
            VALUES
            (?$PARAM_INSERT_PLACEHOLDER)
        `;
        const queryValues = [id$PARAM_LIST];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }
}