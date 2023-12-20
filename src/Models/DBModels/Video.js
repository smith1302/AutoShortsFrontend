import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class Video extends DatabaseModel {

    constructor({ id, seriesID, userID, title, script, caption, scheduledDate, postedDate, videoUrl, posted, created, updated, jobID, pendingCreation }) {
        super();
        this.id = id;
        this.seriesID = seriesID;
		this.userID = userID;
		this.title = title;
		this.script = script;
		this.caption = caption;
		this.scheduledDate = scheduledDate;
		this.postedDate = postedDate;
		this.videoUrl = videoUrl;
		this.posted = posted;
		this.created = created;
		this.updated = updated;
		this.jobID = jobID;
		this.pendingCreation = pendingCreation;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new Video(data);
    }

    static tableName() {
        return this.name;
    }

    /* ==== DB Helpers ==== */

    static async create({ id, seriesID, userID, title, script, caption, scheduledDate}) {
        const query = `
            INSERT INTO ${this.tableName()}
            (id, seriesID, userID, title, script, caption, scheduledDate)
            VALUES
            (?, ?, ?, ?, ?, ?, ?)
        `;
        const queryValues = [id, seriesID, userID, title, script, caption, scheduledDate];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }
}