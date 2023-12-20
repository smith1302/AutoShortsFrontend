import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'GET') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    if (!req.user.master) {
        return res.status(400).end(`Not authorized`);
    }

    const email = req.query.email;
    const user = await User.findOne({where: {email: email}});
    return res.status(200).json({user});
});