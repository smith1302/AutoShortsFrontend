import ApiHandler from '~/src/Services/ApiHandler';
import TikTok from '~/src/Models/TikTok';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    
    const tiktok = new TikTok();
    // Save the page the user initiated the auth from so we can send them back.
    const referer = req.headers.referer;
    const stateToken = tiktok.encodeStateToken({finalRedirectURL: referer, userID: req.user.id});
    const authUrl = tiktok.getAuthUrl(stateToken);

    return res.status(200).json({success: true, authUrl: authUrl})
});