import ApiHandler from '~/src/Services/ApiHandler';
import TikTokOAuth from '~/src/Models/TikTokOAuth';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const tiktokOAuth = new TikTokOAuth();
    const stateToken = tiktokOAuth.saveStateToken(res);
    const authUrl = tiktokOAuth.getAuthUrl(stateToken);

    return res.status(200).json({success: true, authUrl: authUrl})
});