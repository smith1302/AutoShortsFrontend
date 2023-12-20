import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';
import AuthHelper from '~/src/Models/AuthHelper';
import LocalUser from '~/src/Models/LocalUser';
import md5 from 'md5';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'PUT') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;
    if (!userID) return;

    const updates = {};
    const {email, password} = req.body;

    if (email) {
        if (!AuthHelper.isValidEmail(email)) throw new Error(`Invalid email format: ${email}`);
        const exists = await User.findOne({where: {email: email}});
        if (exists) throw new Error(`An account with this email already exists.`);

        const current = await User.findOne({where: {id: userID}});
        if (!current.hashedPassword) throw new Error(`It looks like you have not setup a password yet because you are using Google login. Please create a backup password below before you can change your email.`);

        updates.email = email;
    }

    if (password) {
        const hashedPassword = md5(password);
        updates.password = hashedPassword;
    }
    
    if (Object.keys(updates).length > 0) {
        await User.update(updates, userID);
    }

    const updatedDBUser = await User.findOne({where: {id: userID}});
    const localUser = LocalUser.toJSON(updatedDBUser.id, updatedDBUser.email, updatedDBUser.sessionKey, updatedDBUser.source);

    return res.status(200).json(localUser);
});