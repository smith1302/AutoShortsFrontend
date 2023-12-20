import ApiHandler from '~/src/Services/ApiHandler';
import Error from '~/src/Models/DBModels/Error';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'POST') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;
    const error = req.body.error;
    if (!error) return;

    const name = req.body.name;
    if (!name) return;

    await Error.create({error, name, userID});

    return res.status(200).json({success: true});
});