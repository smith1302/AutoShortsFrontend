import ApiHandler from '~/src/Services/ApiHandler';
import ScriptWriter from '~/src/Models/ScriptWriter';
import ContentType from '~/src/Models/ContentType';
import Video from '~/src/Models/DBModels/Video';
import Series from '~/src/Models/DBModels/Series';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;
    const {contentTypeID, contentDetails, voiceID} = req.body;

    if (!userID) throw new Error(`User ID is required.`);
    if (!contentTypeID) throw new Error(`A content type ID is required.`);
    if (!voiceID) throw new Error(`A voice ID is required.`);

    const scriptWriter = new ScriptWriter();
    const script = await scriptWriter.writeScript({basePrompt: contentDetails});

    console.log(script);

    const seriesID = await Series.create({
        userID: userID, 
        contentTypeID: contentTypeID,
        contentDetails: contentDetails,
        voiceID: voiceID,
    });

    const scheduledDate = toMysqlFormat(getNextPostDate());

    const videoID = await Video.create({
        seriesID: seriesID,
        userID: userID,
        title: script.title,
        script: script.script,
        caption: script.caption,
        scheduledDate: scheduledDate
    });

    return res.status(200).json({success: true, seriesID, videoID});
});

function toMysqlFormat(date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

function getNextPostDate() {
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