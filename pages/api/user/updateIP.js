import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';
import CountryLookup from '~/src/Models/CountryLookup';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;
    if (!userID) return;

    const IP = req.IP;
    if (!IP) return;

    const country = await CountryLookup.getCountry(IP);

    await User.update({IP: IP, country: country}, userID);

    return res.status(200).json({success: true});
});