import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

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
}