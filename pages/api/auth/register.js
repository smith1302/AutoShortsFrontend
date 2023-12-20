import md5 from 'md5';
import ApiHandler from '~/src/Services/ApiHandler';
import { RegisterSource } from '~/src/enums';
import User from '~/src/Models/DBModels/User';
import AuthConfirmCode from '~/src/Models/DBModels/AuthConfirmCode';
import AuthHelper from '~/src/Models/AuthHelper';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const { email, password, authCode, affiliateRef, referralURL, referralQueryParams } = req.body;
    
    if (!email) throw new Error("Missing email");
    if (!password) throw new Error("Missing password");
    if (!authCode) throw new Error("Missing confirmation code");
    if (!AuthHelper.isValidEmail(email)) throw new Error("Invalid email format");

    const existingUser = await User.findOne({where: {email: email}});
    if (existingUser) throw new Error("An account with this email exists.");

    const matchingAuthCode = await AuthConfirmCode.findOne({where: {email: email, code: authCode}});
    if (!matchingAuthCode) throw new Error("This confirmation code is invalid.");

    const hashedPassword = md5(password);
    const IP = req.IP || '';

    const response = await AuthHelper.registerNewUser({
        email: email, 
        hashedPassword: hashedPassword, 
        IP: IP, 
        source: RegisterSource.Manual, 
        affiliateRef: affiliateRef, 
        referralURL: referralURL, 
        referralQueryParams: referralQueryParams
    });
    return res.status(200).json(response);
});