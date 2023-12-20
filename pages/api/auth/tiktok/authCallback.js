import ApiHandler from '~/src/Services/ApiHandler';
import TikTokOAuth from '~/src/Models/TikTokOAuth';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const tiktokOAuth = new TikTokOAuth();

    try {
        const code = req.query.code; // Get the authorization code from query params
        if (!code) return res.status(400).json({ error: 'Authorization code is required' });

        const tiktokOAuth = new TikTokOAuth();
        const tokens = await tiktokOAuth.exchangeCodeForToken(code);

        if (tokens) {
            // Process the tokens (e.g., store them securely)
            // Redirect to a success page or send a success response
            return res.redirect('/success'); // Example redirection after successful handling
        } else {
            // Handle error scenario
            return res.status(500).json({ error: 'Failed to exchange code for tokens' });
        }
    } catch (error) {
        console.error('Error in TikTok callback:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

    return res.redirect(authUrl);
});