import ApiHandler from '~/src/Services/ApiHandler';
import SendGrid from '~/src/Models/SendGrid';
import globals from '~/src/globals';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    let { email, subject, name, message } = req.body;
    if (!email) throw new Error("Missing email");
    if (!subject) throw new Error("Missing subject");
    if (!name) throw new Error("Missing name");
    if (!message) throw new Error("Missing message");


    name = name.substring(0, 120);
    email = email.substring(0, 255);
    subject = subject.substring(0, 120);
    message = message.substring(0, 1200);
    const IP = req.IP;
    const userID = req.user?.id;

    message = `Name: ${name}\nMessage:\n\n${message}\n\n${IP ? `IP: ${IP}\n`: ''}${userID ? `ID: ${userID}`: ''}`;

    // Send email to us
    const emailInstance = new SendGrid({
        to: globals.contactEmail, 
        replyTo: `${name} <${email}>`,
        subject: subject,
        text: message
    });
    await emailInstance.send();

    // Send the session token back down
    res.status(200).json({success: true});
});