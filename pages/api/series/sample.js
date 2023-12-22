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
    const {sampleDetails} = req.body;

    if (!userID) throw new Error(`User ID is required.`);
    if (!sampleDetails) throw new Error(`sampleDetails is required.`);

    const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const scriptWriter = new ScriptWriter();
    const script = await scriptWriter.writeScript({basePrompt: sampleDetails});

    // const sample =`Title: ${script.title}\n\Script: ${script.script}\n\nCaption: ${script.caption}`;
    const sample =`${script.script}`;

    await new Promise(resolve => setTimeout(resolve, 2000));

    return res.status(200).json({success: true, sample, full: script});
});