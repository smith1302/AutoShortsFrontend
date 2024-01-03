import { toMysqlDateFormat } from '~/src/Utils/time';
import ScriptWriter from '~/src/Models/ScriptWriter';
import Video from '~/src/Models/DBModels/Video';
import Series from '~/src/Models/DBModels/Series';
import User from '~/src/Models/DBModels/User';

export default class VideoScheduler {
    constructor() {
    }

    async batchScheduleVideos({limit = 1}) {
        const pendingSeries = await Series.seriesThatNeedVideos({limit});
        for (const series of pendingSeries) {
            console.log(`# Scheduling video for series: ${series.id}`);
            await this.scheduleNextVideoInSeries({seriesID: series.id});
        }
    }

    /*
        When a user changes their plan, the posting schedule for their videos needs to be updated.
    */
    async updateScheduledVideosForUser({userID}) {
        try {
            const plan = await User.getPlan(userID);
            // Get all videos that are scheduled
            const videos = await Video.query(`
                SELECT * FROM ${Video.tableName()}
                WHERE userID = ?
                    AND ${Video.tableName()}.videoUrl IS NOT NULL
                    AND ${Video.tableName()}.scheduledDate IS NOT NULL
                    AND ${Video.tableName()}.publishID IS NULL
                    AND ${Video.tableName()}.publishStatus IS NULL
                    AND ${Video.tableName()}.postID IS NULL
                ORDER BY ${Video.tableName()}.scheduledDate DESC
            `, [userID]);

            // Update the scheduled date for each video
            for (const video of videos) {
                const nextPostDate = toMysqlDateFormat(this.getNextPostDate({frequency: plan.frequency}));
                await Video.update({scheduledDate: nextPostDate}, video.id);
            }
        } catch (error) {
            console.error("Error in updateScheduledVideosForUser:", error);
        }
    }

    async scheduleNextVideoInSeries({seriesID}) {
        const series = await Series.findOne({where: {id: seriesID}});
        const plan = await User.getPlan(series.userID);
        const scheduledDate = toMysqlDateFormat(this.getNextPostDate({frequency: plan.frequency}));
        const scriptWriter = new ScriptWriter();
        const script = await scriptWriter.writeScript({basePrompt: series.prompt});
        const videoID = await Video.create({
            seriesID: series.id,
            userID: series.userID,
            voiceID: series.voiceID,
            title: script.title,
            script: script.script,
            caption: script.caption,
            backgroundVideo: script.background,
            scheduledDate: scheduledDate
        });
        return {videoID, videoTitle: script.title};
    }
    
    getNextPostDate({ frequency }) {
        const now = new Date();
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let postDays = ['Wednesday'];
        let postTimes = [12]; // Post at 12 PM UTC
        if (frequency == 1) {
            // Defaults are fine
        } else if (frequency == 3) { // 3 days a week
            postDays = ['Monday', 'Wednesday', 'Friday'];
        } else if (frequency == 5) { // 5 days a week
            postDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        } else if (frequency == 7) { // 7 days a week
            postDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        } else if (frequency == 14) { // 14 days a week
            postTimes = [8, 16]; // Post at 8 AM and 4 PM UTC
        } else {
            throw new Error(`Invalid frequency: ${frequency}`);
        }

        const currentHour = now.getUTCHours();
        // Get the next post time
        let nextPostTime = null;
        for (const postHour of postTimes) {
            if (currentHour < postHour) {
                nextPostTime = postHour;
                break;
            }
        }

        // No more post times today. Default to the first post time tomorrow.
        let startDayOffset = 0;
        if (!nextPostTime) {
            nextPostTime = postTimes[0];
            startDayOffset = 1;
        }

        // Find the next post day
        let currentDayIndex = now.getUTCDay();
        let dayIterator = startDayOffset;
        do {
            const dayIndex = (currentDayIndex + dayIterator) % 7;
            const dayName = daysOfWeek[dayIndex];
            // Check if this day is a post day
            if (postDays.includes(dayName)) break;
            // Iterate through each day
            dayIterator++;
        } while (dayIterator < 14); // Fail safe to prevent infinite loops

        // Calculate the next post date
        const nextPostDate = new Date(now);
        nextPostDate.setUTCDate(now.getUTCDate() + dayIterator);
        nextPostDate.setUTCHours(nextPostTime, 0, 0, 0);

        return nextPostDate;
    }
}