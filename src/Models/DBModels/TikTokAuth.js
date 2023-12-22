import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class TikTokAuth extends DatabaseModel {

    constructor({ userID, openID, data, displayName, avatarURL, profileURL }) {
        super();
        this.userID = userID;
		this.openID = openID;
		this.data = data;
        this.displayName = displayName;
        this.avatarURL = avatarURL;
        this.profileURL = profileURL;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new TikTokAuth(data);
    }

    static tableName() {
        return this.name;
    }

    /* ==== DB Helpers ==== */

    static async create({ userID, openID, refreshExpiresAt, data, displayName, avatarURL, profileURL }) {
        const query = `
            INSERT INTO ${this.tableName()}
            (userID, openID, refreshExpiresAt, data, displayName, avatarURL, profileURL)
            VALUES
            (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            userID = VALUES(userID),
            refreshExpiresAt = VALUES(refreshExpiresAt),
            data = VALUES(data),
            displayName = VALUES(displayName),
            avatarURL = VALUES(avatarURL),
            profileURL = VALUES(profileURL)
        `;
        const queryValues = [userID, openID, refreshExpiresAt, data, displayName, avatarURL, profileURL];
        const response = await this.query(query, queryValues);
        // 'response.insertId' will be 0 if an update occurred
        return response.insertId;
    }

    static async getAllWithActiveTokens(userID) {
        const query = `
            SELECT * 
            FROM ${this.tableName()}
            WHERE userID = ? 
                AND NOW() < FROM_UNIXTIME(refreshExpiresAt - 7 * 24 * 60 * 60)
        `;
        const queryValues = [userID];
        return await this.query(query, queryValues);
    }
}