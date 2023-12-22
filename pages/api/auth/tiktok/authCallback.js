import ApiHandler from '~/src/Services/ApiHandler';
import TikTok from '~/src/Models/TikTok';
import TikTokAuth from '~/src/Models/DBModels/TikTokAuth';
import paths from '~/src/paths';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    let success = false;
    let finalRedirectURL = null;

    try {
        const code = req.query.code; // Get the authorization code from query params
        const state = req.query.state; // Get the state from query params
        const error = req.query.error; // Get the error from query params
        if (!code || !state) throw new Error('Missing required query parameters');
        if (error) throw new Error(error);

        const tiktok = new TikTok();
        // Grab important info from the state token
        const decodedState = await tiktok.decodeStateToken(state);
        const userID = decodedState.userID;
        finalRedirectURL = decodedState.finalRedirectURL;
        if (!userID) throw new Error('Invalid state token');

        // Fetch the access token
        const tokenData = await tiktok.exchangeTokenForCode(code);
        if (!tokenData) throw new Error('Failed to fetch access token');

        // Fetch the user info
        const { user } = await tiktok.fetchUserInfo(tokenData);
        if (!user) throw new Error('Failed to fetch user info');

        // Save the token data to our DB
        await TikTokAuth.create({ 
            userID: userID, 
            openID: tokenData.open_id,
            refreshExpiresAt: tokenData.refresh_expires_at,
            data: JSON.stringify(tokenData),
            displayName: user.display_name,
            avatarURL: user.avatar_url,
            profileURL: user.profile_deep_link || 'test'
        });

        success = true;

    } catch (error) {
        console.error('Error in TikTok callback:', error);
        success = false;
    }

    finalRedirectURL = finalRedirectURL || paths.createSeries;
    // Remove an query params that might already be in the URL
    finalRedirectURL = finalRedirectURL.split('?')[0];
    
    return res.redirect(`${finalRedirectURL}?success=${success}`);
});