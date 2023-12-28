import axios from 'axios';
import jwt from 'jsonwebtoken';
import querystring from 'querystring';
import TikTokAuth from '~/src/Models/DBModels/TikTokAuth';

export default class TikTok {

    static JWT_SECRET = 'dfs#AAC_WSF@';

    constructor() {
        this.clientKey = process.env.TikTokClientKey;
        this.clientSecret = process.env.TikTokClientSecret;
        this.redirectUri = process.env.TikTokRedirectUri;
    }

    /* Auth Handling */

    getAuthUrl(state) {
        return `https://www.tiktok.com/v2/auth/authorize?client_key=${this.clientKey}&scope=user.info.basic,video.publish,video.upload&response_type=code&redirect_uri=${encodeURIComponent(this.redirectUri)}&state=${state}`;
    }

    encodeStateToken({finalRedirectURL, userID}) {
        const payload = { finalRedirectURL, userID };
        const token = jwt.sign(payload, TikTok.JWT_SECRET, { expiresIn: '1h' });
        return token;
    }

    decodeStateToken(state) {
        const decoded = jwt.verify(state, TikTok.JWT_SECRET);
        return decoded;
    }

    addExpiresAtToTokenData(tokenData) {
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        tokenData.expires_at = currentTime + tokenData.expires_in;
        tokenData.refresh_expires_at = currentTime + tokenData.refresh_expires_in;
        return tokenData;
    }

    async exchangeTokenForCode(code) {
        const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
        const params = {
            client_key: this.clientKey,
            client_secret: this.clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: this.redirectUri
        };

        const response = await axios.post(tokenUrl, querystring.stringify(params), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        return this.addExpiresAtToTokenData(response.data);
    }

    /* Refreshes and saves the new token data */
    async refreshToken(refreshToken) {
        const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
        const params = {
            client_key: this.clientKey,
            client_secret: this.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        };

        const response = await axios.post(tokenUrl, querystring.stringify(params), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        const refreshedTokenData = this.addExpiresAtToTokenData(response.data);

        // Save the new token data
        const query = `
            UPDATE ${TikTokAuth.tableName()}
            SET data = ?, refreshExpiresAt = ?, updated = NOW()
            WHERE openID = ?
        `;
        const queryValues = [JSON.stringify(refreshedTokenData), refreshedTokenData.refresh_expires_at, refreshedTokenData.open_id];
        await TikTokAuth.query(query, queryValues);

        return refreshedTokenData;
    }

    /* Refreshes the token if it's expired */
    async refreshTokenIfNeeded(tokenData) {
        // If the token is expired, refresh it
        if (this.isTokenExpired(tokenData)) {
            console.log(`Token expired, refreshing...`);
            return await this.refreshToken(tokenData.refresh_token);
        }
        return tokenData;
    }

    async getTokenData(openID) {
        const tokenData = await TikTokAuth.findOne({ where: { openID: openID } });
        if (!tokenData) return null;
        return JSON.parse(tokenData.data);
    }

    isTokenExpired(tokenData) {
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        return tokenData && currentTime >= tokenData.expires_at;
    }

    /* User Handling */

    async fetchUserInfo(tokenData) {
        const endpoint = 'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name';
        const response = await this.makeApiCall(tokenData, endpoint);
        return response.data;
    }

    async fetchCreatorInfo(tokenData) {
        const endpoint = 'https://open.tiktokapis.com/v2/post/publish/creator_info/query/';
        const response = await this.makeApiCall(tokenData, endpoint, 'POST');
        return response.data;
    }

    /* API Handling */

    async makeApiCall(tokenData, endpoint, method = 'GET', data = null) {
        tokenData = await this.refreshTokenIfNeeded(tokenData);
        try {
            if (!tokenData) throw new Error('No token data provided');

            const config = {
                method: method,
                url: endpoint,
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'Content-Type': 'application/json'
                },
                ...(data && { data })
            };
    
            const response = await axios(config);
            return response.data;
        } catch (error) {
            // Handle error
            throw error;
        }
    }
}