import ApiHandler from '~/src/Services/ApiHandler';
import Feedback from '~/src/Models/DBModels/Feedback';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;
    const {feedback} = req.body;

    if (!userID) throw new Error(`User ID is required.`);
    if (!feedback) throw new Error(`Feedback is required.`);

    Feedback.create({feedback, userID});

    return res.status(200).json({success: true});
});