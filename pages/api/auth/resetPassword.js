import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';
import md5 from 'md5';
import ResetPasswordCode from '~/src/Models/DBModels/ResetPasswordCode';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const { password, code } = req.body;
    
    if (!password) throw new Error("Please enter a password");
    if (!code) throw new Error("Missing reset token");

    // Match the client provided code with the one in the database.
    const matchingReset = await ResetPasswordCode.findOne({where: {code: code}});
    if (!matchingReset) throw new Error("Reset token is not valid");

    // Get the user associated with the email sent with the code.
    const matchingUser = await User.findOne({where: {email: matchingReset.email}});
    if (!matchingUser) throw new Error("No account with this email exists. Please enter the email for an existing password you wish to reset.");

    // Update user with the new password.
    const hashedPassword = md5(password);
    await User.update({password: hashedPassword}, matchingUser.id);

    // Delete the code since it's been used.
    await ResetPasswordCode.delete({where: {id: matchingReset.id}});

    return res.status(200).json({success: true});
});