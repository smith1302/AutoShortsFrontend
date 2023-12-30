import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';
import Series from "~/src/Models/DBModels/Series";
import TikTokAuth from "~/src/Models/DBModels/TikTokAuth";
import paths from '~/src/paths';
import PUBLISH_STATUS from '~/src/Enums/VideoPublishStatus';
/*
    To trigger a new render:
    - Set jobID to null and pendingCreation to 1
*/
export default class Video extends DatabaseModel {

    constructor({ id, seriesID, userID, voiceID, title, script, caption, backgroundVideo, scheduledDate, postedDate, videoUrl, posted, created, updated, jobID, pendingCreation, publishID, publishStatus, postID, ...other }) {
        super();
        this.id = id;
        this.seriesID = seriesID;
		this.userID = userID;
        this.voiceID = voiceID;
		this.title = title;
		this.script = script;
		this.caption = caption;
        this.backgroundVideo = backgroundVideo;
		this.scheduledDate = scheduledDate;
		this.postedDate = postedDate;
		this.videoUrl = videoUrl;
		this.posted = posted;
		this.created = created;
		this.updated = updated;
		this.jobID = jobID;
		this.pendingCreation = pendingCreation;
        this.publishID = publishID; // The ID of the TikTok upload job
        this.publishStatus = publishStatus; // The status of the TikTok upload job
        this.postID = postID; // The ID of the TikTok post
        this.other = other;
    }

    requiresNewRender({title, caption, script}) {
        return this.title !== title || this.caption !== caption || this.script !== script;
    }

    getPublicRenderedUrl() {
        return `${paths.renderedVideos}/${this.videoUrl}`;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new Video(data);
    }

    static tableName() {
        return this.name;
    }

    /* ==== DB Helpers ==== */

    static async create({ id, seriesID, userID, voiceID, title, script, caption, backgroundVideo, scheduledDate}) {
        const query = `
            INSERT INTO ${this.tableName()}
            (id, seriesID, userID, voiceID, title, script, caption, backgroundVideo, scheduledDate)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const queryValues = [id, seriesID, userID, voiceID, title, script, caption, backgroundVideo, scheduledDate];
        const response = await this.query(query, queryValues);
        return response.insertId;
    }

    /* Videos that need to be be sent to TikTok for upload */
    static async pendingUploads() {
        const query = `
            SELECT ${this.tableName()}.*, 
                    ${TikTokAuth.tableName()}.data AS tokenData,
                    ${Series.tableName()}.privacy,
                    ${Series.tableName()}.duetDisabled AS duetDisabled,
                    ${Series.tableName()}.stitchDisabled AS stitchDisabled,
                    ${Series.tableName()}.commentDisabled AS commentDisabled
            FROM ${this.tableName()}
            JOIN ${Series.tableName()} 
                ON ${Series.tableName()}.id = ${this.tableName()}.seriesID
            JOIN ${TikTokAuth.tableName()}
                ON ${TikTokAuth.tableName()}.openID = ${Series.tableName()}.openID
            WHERE NOW() >= ${this.tableName()}.scheduledDate
                AND ${this.tableName()}.videoUrl IS NOT NULL
                AND ${this.tableName()}.publishID IS NULL
                AND ${this.tableName()}.publishStatus IS NULL
                AND ${this.tableName()}.postID IS NULL
            ORDER BY ${this.tableName()}.scheduledDate ASC
        `;
        return this.query(query);
    }

    /* Videos are in the process of being uploaded to TikTok */
    static async pendingPostUpdates() {
        const query = `
            SELECT ${this.tableName()}.*, 
                    ${TikTokAuth.tableName()}.data AS tokenData 
            FROM ${this.tableName()}
            JOIN ${Series.tableName()} 
                ON ${Series.tableName()}.id = ${this.tableName()}.seriesID
            JOIN ${TikTokAuth.tableName()}
                ON ${TikTokAuth.tableName()}.openID = ${Series.tableName()}.openID
            WHERE NOW() >= ${this.tableName()}.scheduledDate
                AND ${this.tableName()}.publishID IS NOT NULL
                AND (
                    ${this.tableName()}.publishStatus = '${PUBLISH_STATUS.PROCESSING}'
                    OR ${this.tableName()}.publishStatus IS NULL
                )
            ORDER BY ${this.tableName()}.scheduledDate ASC
        `;
        return this.query(query);
    }
}