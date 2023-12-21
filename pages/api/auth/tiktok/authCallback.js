import ApiHandler from '~/src/Services/ApiHandler';
import TikTokOAuth from '~/src/Models/TikTokOAuth';
import TikTokAuth from '~/src/Models/DBModels/TikTokAuth';
import paths from '~/src/paths';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    let success = false;
    let finalRedirectURL = null;

    try {
        const userID = req.user.id;
        const code = req.query.code; // Get the authorization code from query params
        const state = req.query.state; // Get the state from query params
        const error = req.query.error; // Get the error from query params
        if (!code || !state) throw new Error('Missing required query parameters');
        if (error) throw new Error(error);

        const tiktokOAuth = new TikTokOAuth();
        const verified = await tiktokOAuth.validateStateToken(req, state);
        if (!verified) throw new Error('Invalid state token');

        finalRedirectURL = tiktokOAuth.getFinalRedirectURL(req);

        const tokens = await tiktokOAuth.fetchAccessToken(code);
        if (!tokens) throw new Error('Failed to fetch access token');

        await TikTokAuth.create({ 
            userID: userID, 
            open_id: tokens.open_id, 
            data: JSON.stringify(tokens) 
        });

        success = true;

    } catch (error) {
        console.error('Error in TikTok callback:', error);
        success = false;
    }

    finalRedirectURL = finalRedirectURL || paths.createSeries;
    
    return res.redirect(`${finalRedirectURL}?success=${success}}`);
});