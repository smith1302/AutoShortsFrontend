import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;
    const paypal = req.body?.paypal;
    if (!paypal) throw new Error("Please enter a PayPal email");

    await User.update({affiliatePayPal: paypal}, userID);

    return res.status(200).json({success: true});
});