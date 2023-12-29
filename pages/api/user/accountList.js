import ApiHandler from '~/src/Services/ApiHandler';
import TikTokAuth from '~/src/Models/DBModels/TikTokAuth';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;
    let tiktokAccounts = await TikTokAuth.getAllWithActiveTokens(userID);
    tiktokAccounts = await Promise.all(tiktokAccounts.map(async (tiktokAccount) => {
        // Make sure we have the latest information
        const creatorInfo = await TikTokAuth.getCreatorInfo({openID: tiktokAccount.openID});
        return {
            openID: tiktokAccount.openID,
            displayName: creatorInfo?.creator_nickname || tiktokAccount.displayName,
            avatarURL: creatorInfo?.creator_avatar_url || tiktokAccount.avatarURL,
            creatorInfo: creatorInfo,
        }
    }));

    return res.status(200).json({tiktok: tiktokAccounts});
});