import ApiHandler from '~/src/Services/ApiHandler';
import Error from '~/src/Models/DBModels/Error';
import BotCheck from '~/src/Models/DBModels/BotCheck';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'POST') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;
    const token = req.body.token;
    if (!token) throw new Error("Captcha value has not been provided or expired.")

    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`);
    if (!response.ok) throw new Error("Captcha verification failed.");

    await BotCheck.markVerified({ userID });

    return res.status(200).json({success: true});
});