
import ApiHandler from '~/src/Services/ApiHandler';
import Event from '~/src/Models/DBModels/Event';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    if (req.user && req.user.id && !req.user.master) {
        let {name, data} = req.body;
        await Event.create({userID: req.user.id, name: name, data: data});
        return res.status(200).json({success: true});
    } else {
        return res.status(400).json({success: false});
    }
});
