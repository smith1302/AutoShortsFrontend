import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';
import ResetPasswordCode from '~/src/Models/DBModels/ResetPasswordCode';
import crypto from "crypto";
import paths from "~/src/paths";
import globals from "~/src/globals";
import SendGrid from '~/src/Models/SendGrid';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const { email } = req.body;
    
    if (!email) throw new Error("Missing email");

    const existingUser = await User.findOne({where: {email: email}});
    if (!existingUser) throw new Error("No account with this email exists. Please enter the email for an existing account you wish to reset.");

    const code = crypto.randomBytes(8).toString("hex");
    await ResetPasswordCode.create({email, code});

    const resetURL = `${globals.fullURL}${paths.resetPassword(code)}`;
    await SendGrid.resetPassword(email, resetURL).send();

    return res.status(200).json({success: true});
});