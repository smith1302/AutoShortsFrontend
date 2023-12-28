import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

/*
    To trigger a new render:
    - Set jobID to null and pendingCreation to 1
*/
export default class Video extends DatabaseModel {

    constructor({ id, seriesID, userID, voiceID, title, script, caption, scheduledDate, postedDate, videoUrl, posted, created, updated, jobID, pendingCreation }) {
        super();
        this.id = id;
        this.seriesID = seriesID;
		this.userID = userID;
        this.voiceID = voiceID;
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

    static async create({ id, seriesID, userID, voiceID, title, script, caption, scheduledDate}) {
        const query = `
            INSERT INTO ${this.tableName()}
            (id, seriesID, userID, voiceID, title, script, caption, scheduledDate)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const queryValues = [id, seriesID, userID, voiceID, title, script, caption, scheduledDate];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }
}