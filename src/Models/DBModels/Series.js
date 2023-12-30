import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';
import Video from "~/src/Models/DBModels/Video";

export default class Series extends DatabaseModel {

    constructor({ id, title, userID, openID, contentTypeID, prompt, voiceID, duetDisabled, stitchDisabled, commentDisabled, privacy, created }) {
        super();
        this.id = id;
        this.title = title;
        this.userID = userID;
        this.openID = openID;
        this.contentTypeID = contentTypeID;
		this.prompt = prompt;
		this.voiceID = voiceID;
        this.duetDisabled = duetDisabled;
        this.stitchDisabled = stitchDisabled;
        this.commentDisabled = commentDisabled;
        this.privacy = privacy;
		this.created = created;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new Series(data);
    }

    static tableName() {
        return this.name;
    }

    /* ==== DB Helpers ==== */

    static async create({ title = 'My Series', userID, openID, contentTypeID, prompt, voiceID, duetDisabled = true, stitchDisabled = true, commentDisabled = true, privacy }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (title, userID, openID, contentTypeID, prompt, voiceID, duetDisabled, stitchDisabled, commentDisabled, privacy)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const queryValues = [title, userID, openID, contentTypeID, prompt, voiceID, duetDisabled, stitchDisabled, commentDisabled, privacy];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }

    static async seriesThatNeedVideos({ limit = 10 }) {
        // Get all series that do not have a scheduled video
        // To do this we get all videos are not published and don't include them (left join)
        // We will ignore new series (created < 1 hour ago) since they're first video is probably still processing
        const series = this.tableName();
        const video = Video.tableName();
        const query = `
            SELECT ${series}.*
            FROM ${series}
            LEFT JOIN ${video}
                ON ${series}.id = ${video}.seriesID
                AND (
                    ${video}.publishStatus != 'PUBLISH_COMPLETE' 
                    OR ${video}.publishStatus IS NULL
                )
            WHERE ${video}.seriesID IS NULL
                AND ${series}.created < NOW() - INTERVAL 1 HOUR
            LIMIT ?
        `;
        return await this.query(query, [limit]);
    }
}