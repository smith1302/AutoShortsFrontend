import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

export default class TikTokOAuth {

    static JWT_SECRET = 'dfs#AAC_WSF@';

    constructor() {
        this.clientKey = process.env.TikTokClientKey;
        this.clientSecret = process.env.TikTokClientSecret;
        this.redirectUri = process.env.TikTokRedirectUri;
    }

    getAuthUrl(state) {
        return `https://www.tiktok.com/v2/auth/authorize?client_key=${this.clientKey}&scope=user.info.basic,video.publish,video.upload&response_type=code&redirect_uri=${encodeURIComponent(this.redirectUri)}&state=${state}`;
    }

    saveStateToken(res) {
        const csrfToken = uuidv4();
        const token = jwt.sign({ csrfToken }, TikTokOAuth.JWT_SECRET, { expiresIn: '1h' });
        res.setHeader('Set-Cookie', `csrfToken=${token}; HttpOnly; Path=/; Max-Age=3600`);
        return csrfToken;
    }

    saveFinalRedirectURL(res, url) {
        res.setHeader('Set-Cookie', `finalRedirectURL=${url}; HttpOnly; Path=/; Max-Age=3600`);
    }

    validateStateToken(req, state) {
        const token = req.cookies.csrfToken
        const decoded = jwt.verify(token, TikTokOAuth.JWT_SECRET);
        const csrfToken = decoded.csrfToken;
        return csrfToken === state;
    }

    getFinalRedirectURL(req) {
        return req.cookies.finalRedirectURL;
    }

    async fetchAccessToken(code) {
        const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
        const params = {
            client_key: this.clientKey,
            client_secret: this.clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: this.redirectUri
        };

        const response = await axios.post(tokenUrl, querystring.stringify(params), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        return response.data;
    }

    async refreshToken(refreshToken) {
        const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
        const params = {
            client_key: this.clientKey,
            client_secret: this.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        };

        const response = await axios.post(tokenUrl, querystring.stringify(params), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        return response.data;
    }

    async refreshTokenIfNeeded(tokenData) {
        if (!tokenData) return null;

        const currentTime = new Date().getTime() / 1000;
        if (currentTime >= tokenData.expires_in) {
            return await this.refreshToken(tokenData.refresh_token);
        }

        return tokenData;
    }
}