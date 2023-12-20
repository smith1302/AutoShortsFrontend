import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class BlacklistEmailProvider extends DatabaseModel {

    constructor({ id, provider }) {
        super();
        this.id = id;
        this.provider = provider;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new BlacklistEmailProvider(data);
    }

    static tableName() {
        return "BlacklistEmailProvider";
    }
}