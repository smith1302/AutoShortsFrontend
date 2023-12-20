import ApiHandler from '~/src/Services/ApiHandler';
import ResetPasswordCode from '~/src/Models/DBModels/ResetPasswordCode';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const { code } = req.body;
    if (!code) throw new Error("Missing reset token");

    const matchingReset = await ResetPasswordCode.findOne({where: {code: code}});
    if (!matchingReset) throw new Error("Reset token is not valid");

    return res.status(200).json({success: true});
});