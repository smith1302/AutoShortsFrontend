import ScriptWriter from '~/src/Models/ScriptWriter';
import ContentType from '~/src/Models/ContentType';
import Video from '~/src/Models/DBModels/Video';
import Series from '~/src/Models/DBModels/Series';

export default class VideoScheduler {
    constructor() {
    }

    async scheduleNextVideoInSeries({seriesID}) {
        const series = await Series.findOne({where: {id: seriesID}});
        const scheduledDate = this.toMysqlFormat(this.getNextPostDate());
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

    toMysqlFormat(date) {
        return date.toISOString().slice(0, 19).replace('T', ' ');
    }
    
    getNextPostDate() {
        const now = new Date();
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const postDays = { 'Monday': 1, 'Wednesday': 3, 'Friday': 5 };
    
        // If current time is after 12 PM UTC, choose the next date
        let dayOffset = 0;
        if (now.getUTCHours() >= 11) {
            dayOffset = 1;
        }
        // Find the next post day
        let daysToAdd = 0;
        let currentDayIndex = now.getUTCDay() + dayOffset;
        while (!postDays[daysOfWeek[(currentDayIndex + daysToAdd) % 7]]) {
            daysToAdd++;
        }
    
        // Calculate the next post date
        const nextPostDate = new Date(now);
        nextPostDate.setUTCDate(now.getUTCDate() + daysToAdd);
        nextPostDate.setUTCHours(12, 0, 0, 0); // Set to 12 PM UTC
    
        return nextPostDate;
    }
}