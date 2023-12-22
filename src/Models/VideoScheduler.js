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
            title: script.title,
            script: script.script,
            caption: script.caption,
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
    
        // Find the next post day
        let daysToAdd = 0;
        let currentDayIndex = now.getDay();
        while (!postDays[daysOfWeek[(currentDayIndex + daysToAdd) % 7]]) {
            daysToAdd++;
        }
    
        // Calculate the next post date
        const nextPostDate = new Date(now);
        nextPostDate.setDate(now.getDate() + daysToAdd);
        nextPostDate.setHours(12, 0, 0, 0); // Set to 12 PM
    
        return nextPostDate;
    }
}