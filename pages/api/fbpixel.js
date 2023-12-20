import ApiHandler from '~/src/Services/ApiHandler';
import FBPixel from '~/src/Models/FBPixel';

export default ApiHandler(false, async (req, res) => {
    const event = req.body.event;
    const eventID = req.body.eventID;
    const email = req.body.email;
    const externalID = req.body.userID;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await FBPixel.log(event, eventID, {ip, userAgent, email, externalID});
    res.status(200).json({success: true});
});
