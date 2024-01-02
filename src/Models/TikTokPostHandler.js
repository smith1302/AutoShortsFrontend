import TikTok from "~/src/Models/TikTok";
import Video from "~/src/Models/DBModels/Video";
import Series from "~/src/Models/DBModels/Series";
import { defaultPrivacyLevel } from '~/src/Enums/TikTokPrivacy';
import { PUBLISH_STATUS } from '~/src/Enums/VideoPublishStatus';
import { toMysqlDateFormat } from '~/src/Utils/time';

export default class TikTokPostHandler {

    /* Checks the status of all videos that are uploading */
    static async checkPostStatus() {
        const pendingVideos = await this.videosPendingPost();
        console.log(`# Checking video post statuses | ${pendingVideos.length} videos pending.`);
        for (const video of pendingVideos) {
            await this.updateVideoPostStatus(video);
        }
    }

    /* Uploads all videos that are yet to be uploaded */
    static async uploadPendingVideos() {
        const pendingVideos = await this.videosPendingUpload();
        console.log(`# Uploading Videos | ${pendingVideos.length} videos pending.`);
        for (const video of pendingVideos) {
            const publishID = await this.uploadVideo(video);
            console.log(`=> Video uploaded with publishID: ${publishID}. VideoID: ${video.id}`);
            await Video.update({publishID}, video.id);
            break;
        }
    }

    /* ==== Private ==== */

    static async updateVideoPostStatus(video) {
        try {
            const data = await this.checkVideoStatus(video);
            if (!data) return;

            // Update the video's publish status
            const updateFields = {publishStatus: data.status,}
            // For public posts, get the ID
            if (data.publicaly_available_post_id?.length) {
                updateFields.publishID = data.publicaly_available_post_id[0];
            }
            if (data.fail_reason) {
                updateFields.publishFailReason = data.fail_reason;
            }
            if (data.status == PUBLISH_STATUS.PUBLISHED) {
                const nowUTC = toMysqlDateFormat(new Date());
                updateFields.postedDate = nowUTC;
            }
            console.log(`=> Updating video [${video.id}] post status to ${data.status}`);
            console.log(updateFields);
            console.log(`------------------`);
            await Video.update(updateFields, video.id);
        } catch (error) {
            console.log(`Failed to update video post status. VideoID: ${video.id}`);
            console.log(error?.response?.data?.error || error.message);
            console.log(`------------------`);
        }
    }

    static async checkVideoStatus(video) {
        let data = null;
        try {
            const tiktok = new TikTok();
            const tokenData = JSON.parse(video.other.tokenData);
            data = await tiktok.checkPublishStatus(tokenData, video.publishID);
        } catch (error) {
            console.log(`Failed to check video status. VideoID: ${video.id}`);
            console.log(error?.response?.data?.error || error.message);
            console.log(`------------------`);
        }
        return data;
    }

    static async uploadVideo(video) {
        let publishID = null;
        try {
            const tokenData = JSON.parse(video.other.tokenData);
            const tiktok = new TikTok();
            const creatorInfo = await tiktok.fetchCreatorInfo(tokenData);
            let postInfo = {
                title: video.caption,
                privacy_level: video.other.privacy,
                disable_duet: Boolean(video.other.duetDisabled),
                disable_stitch: Boolean(video.other.stitchDisabled),
                disable_comment: Boolean(video.other.commentDisabled)
            }
            // Make sure our saved settings is up to date with the creator's settings, as they may have changed.
            postInfo = this.updatePostInfoWithCreatorInfo(postInfo, creatorInfo);
            const renderedVideoURL = video.getPublicRenderedUrl();
            publishID = await tiktok.postVideoFromUrl(tokenData, renderedVideoURL, postInfo);

            // If the series privacy level has changed, update it
            if (postInfo.privacy_level != video.other.privacy) {
                await Series.update({
                    privacy: postInfo.privacy_level,
                    duetDisabled: postInfo.disable_duet,
                    stitchDisabled: postInfo.disable_stitch,
                    commentDisabled: postInfo.disable_comment,
                    privacy: privacy,
                }, video.seriesID);
            }
        } catch (error) {
            console.log(`Failed to upload video. VideoID: ${video.id}`);
            console.log(error?.response?.data?.error || error.message);
            console.log(`------------------`);
        }
        return publishID
    }

    /*
        It's possible the creator changed account settings since the last time we checked.
        This function will reconcile the postInfo with the creatorInfo to make sure we're not
        trying to post a video with settings that are no longer available.
    */
    static updatePostInfoWithCreatorInfo(postInfo, creatorInfo) {
        const newPostInfo = {...postInfo};
        // The selected privacy level is no longer available, so set it to a default.
        const availablePrivacyOptions = creatorInfo.privacy_level_options;
        if (!availablePrivacyOptions.includes(postInfo.privacy_level)) {
            newPostInfo.privacy_level = defaultPrivacyLevel(availablePrivacyOptions);
        }
        // If the creator has disabled duets, stitches, or comments, we need to respect that.
        newPostInfo.disable_duet = creatorInfo.duet_disabled || postInfo.disable_duet;
        newPostInfo.disable_stitch = creatorInfo.stitch_disabled || postInfo.disable_stitch;
        newPostInfo.disable_comment = creatorInfo.comment_disabled || postInfo.disable_comment;

        return newPostInfo;
    }


    static async videosPendingUpload() {
        return Video.pendingUploads();
    }

    static async videosPendingPost() {
        return Video.pendingPostUpdates();
    }
}