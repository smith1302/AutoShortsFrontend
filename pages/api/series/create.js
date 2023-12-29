import ApiHandler from '~/src/Services/ApiHandler';
import ContentType from '~/src/Models/ContentType';
import VideoScheduler from '~/src/Models/VideoScheduler';
import Series from '~/src/Models/DBModels/Series';
import TikTokAuth from '~/src/Models/DBModels/TikTokAuth';
import { PrivacyOptions, PrivacyOptionTitles, defaultPrivacyLevel } from '~/src/Enums/TikTokPrivacy';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;
    const {contentTypeID, customPrompt, voiceID, accountID} = req.body;

    if (!userID) throw new Error(`User ID is required.`);
    if (!contentTypeID) throw new Error(`A content type ID is required.`);
    if (!voiceID) throw new Error(`A voice ID is required.`);
    if (!accountID) throw new Error(`An account is required.`);

    const contentType = await ContentType.find(contentTypeID);
    /* Get the prompt (either use the user provided prompt or a system prompt) */
    let prompt;
    if (customPrompt) {
        prompt = customPrompt;
    } else {
        prompt = contentType.prompt;
    }

    const existingSeriesOfSameContent = await Series.find({where: {contentTypeID: contentTypeID, userID: userID}});
    const existingSeriesOfSameContentCount = existingSeriesOfSameContent ? existingSeriesOfSameContent.length : 0;
    const seriesTitle = `${contentType.name}${existingSeriesOfSameContentCount ? ` #${existingSeriesOfSameContentCount + 1}` : ''}`;

    /* Get the creator's TikTok settings to load defaults */
    const creatorInfo = await TikTokAuth.getCreatorInfo({openID: accountID});
    const privacy = defaultPrivacyLevel(creatorInfo.creator_privacy_options);

    /* Create the series */
    const seriesID = await Series.create({
        title: seriesTitle,
        userID: userID, 
        openID: accountID,
        contentTypeID: contentTypeID,
        prompt: prompt,
        voiceID: voiceID,
        duetDisabled: creatorInfo.duet_disabled,
        stitchDisabled: creatorInfo.stitch_disabled,
        commentDisabled: creatorInfo.comment_disabled,
        privacy: privacy,
    });

    /* Create the first video */
    const videoScheduler = new VideoScheduler();
    const {videoID} = await videoScheduler.scheduleNextVideoInSeries({seriesID});

    return res.status(200).json({success: true, seriesID, videoID});
});