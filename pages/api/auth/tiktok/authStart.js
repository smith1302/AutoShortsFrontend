import ApiHandler from '~/src/Services/ApiHandler';
import TikTokOAuth from '~/src/Models/TikTokOAuth';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const referer = req.headers.referer;
    console.log('Request made from:', referer);

    const tiktokOAuth = new TikTokOAuth();
    // Save the page the user initiated the auth from so we can send them back.
    tiktokOAuth.saveFinalRedirectURL(res, referer);
    const stateToken = tiktokOAuth.saveStateToken(res);
    const authUrl = tiktokOAuth.getAuthUrl(stateToken);

    return res.status(200).json({success: true, authUrl: authUrl})
});