import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class AffiliateMessage extends DatabaseModel {

    static Type = {
        BAN: 'ban',
        WARNING: 'warning'
    }

    constructor({ id, title, message, type, created }) {
        super();
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.created = created;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new AffiliateMessage(data);
    }

    static tableName() {
        return this.name;
    }

    /* ==== DB Helpers ==== */
}