import getConfig from 'next/config';
import md5 from 'md5';
import ApiHandler from '~/src/Services/ApiHandler';
import UserService from '~/src/Services/UserService';
import User from '~/src/Models/DBModels/User';
import AuthHelper from '~/src/Models/AuthHelper';
const { serverRuntimeConfig } = getConfig();

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const { email, password } = req.body;
    if (!email) throw new Error("Missing email");
    if (!password) throw new Error("Missing password");

    const user = await User.findOne({where: {email: email, password: md5(password)}});
    if (!user) throw new Error(`No account with that email/password combination exists (${email})`);

    const response = await AuthHelper.finishLogin(user);
    return res.status(200).json(response);
});