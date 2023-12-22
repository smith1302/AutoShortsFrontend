import ApiHandler from '~/src/Services/ApiHandler';
import TikTokAuth from '~/src/Models/DBModels/TikTokAuth';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;
    let tiktokAccounts = await TikTokAuth.getAllWithActiveTokens(userID);
    tiktokAccounts = tiktokAccounts.map((tiktokAccount) => {
        return {
            openID: tiktokAccount.openID,
            displayName: tiktokAccount.displayName,
            avatarURL: tiktokAccount.avatarURL,
        }
    });

    return res.status(200).json({tiktok: tiktokAccounts});
});