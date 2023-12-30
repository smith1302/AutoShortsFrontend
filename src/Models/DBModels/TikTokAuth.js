import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';
import TikTok from '~/src/Models/TikTok';
import cache from '~/src/Utils/nodeCache';

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

    getTokenData() {
        return JSON.parse(this.data);
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
            profileURL = VALUES(profileURL),
            updated = NOW()
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

    /* ==== Other Helpers ==== */

    static async getCreatorInfo({openID, bypassCache = false}) {
        const cacheKey = `tiktok-creatorinfo-${openID}`;
        const cachedResult = bypassCache ? null : cache.get(cacheKey);
        if (cachedResult) return cachedResult;
        
        // Get the connected TikTok account's token data
        const tiktokAuth = await TikTokAuth.findOne({where: {openID: openID}});
        const tiktok = new TikTok();
        // Fetch the creator info and cache it
        const creatorInfo = await tiktok.fetchCreatorInfo(tiktokAuth.getTokenData());
        // 2 hours since this is the duration of the avatar url
        cache.set(cacheKey, creatorInfo, 60 * 60 * 2);

        // Update the TikTokAuth record with the new info
        const query = `
            UPDATE ${this.tableName()}
            SET displayName = ?, avatarURL = ?, updated = NOW()
            WHERE openID = ?
        `
        const queryValues = [creatorInfo.creator_nickname, creatorInfo.creator_avatar_url, openID];
        await this.query(query, queryValues);

        return creatorInfo;
    }
}