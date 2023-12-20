import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class Announcement extends DatabaseModel {

    constructor({ id, created, title, description }) {
        super();
        this.id = id;
        this.title = title;
        this.description = description;
        this.created = created;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new Announcement(data);
    }

    static tableName() {
        return this.name;
    }

    /* ==== DB Helpers ==== */

    static async recentAnnouncements() {
        const query = `
            SELECT * 
            FROM ${this.tableName()}
            WHERE created > NOW() - INTERVAL 1 MONTH
            AND disable=false
            ORDER BY created DESC
        `;
        const announcements = await this.query(query);
        return announcements;
    }
}