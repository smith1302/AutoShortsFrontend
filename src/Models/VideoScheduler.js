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
    
    getNextPostDate({frequency}) {
        const now = new Date();
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let postDays = [ 'Wednesday' ];
        let postTimes = [12]; // Post at 12 PM UTC
        if (frequency == 1) {
            // Defaults are fine
        } if (frequency == 3) { // 3 days a week
            postDays = [ 'Monday', 'Wednesday', 'Friday' ];
        } else if (frequency == 5) { // 5 days a week
            postDays = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' ];
        } else if (frequency == 7) { // 7 days a week
            postDays = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
        } else if (frequency == 14) { // 14 days a week
            postTimes = [ 8, 16 ]; // Post at 8 AM and 4 PM UTC
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
        let daysToAdd = 0;
        if (!nextPostTime) {
            nextPostTime = postTimes[0];
            daysToAdd = 1;
        }
    
        // Find the next post day
        let currentDayIndex = now.getUTCDay();
        do {
            // Iterate through each day
            currentDayIndex = (currentDayIndex + daysToAdd) % 7;
            const dayName = daysOfWeek[currentDayIndex];
            // Check if this day is a post day
            if (postDays.includes(dayName)) break;
            // If not, add another day
            daysToAdd++;
        } while (daysToAdd < 14); // Fail safe to prevent infinite loops
    
        // Calculate the next post date
        const nextPostDate = new Date(now);
        nextPostDate.setUTCDate(now.getUTCDate() + daysToAdd);
        nextPostDate.setUTCHours(nextPostTime, 0, 0, 0);
    
        return nextPostDate;
    }
}