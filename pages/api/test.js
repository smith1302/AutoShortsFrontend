import ApiHandler from '~/src/Services/ApiHandler';
import PayPalService from '~/src/Services/PayPalService';
import { getFinalCSV } from "~/src/Utils/barChartRaceGenerator";
import SendGrid from '~/src/Models/SendGrid';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    // await getFinalCSV();

    // const result = await PayPalService.createProduct();
    // console.log(result);
    res.status(200).json({success: true});
});