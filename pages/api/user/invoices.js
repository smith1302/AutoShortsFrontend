import ApiHandler from '~/src/Services/ApiHandler';
import Payment from '~/src/Models/DBModels/Payment';
import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default ApiHandler(true, async (req, res) => {
    if (req.method != 'GET') { 
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userID = req.user.id;
    const payments = await DatabaseModel.awaitableQuery(`
        SELECT Payment.*, User.email, InvoiceDetail.custom1, InvoiceDetail.custom2, InvoiceDetail.custom3
        FROM Payment
        JOIN User
            ON User.id = Payment.userID
        LEFT JOIN InvoiceDetail
            ON InvoiceDetail.userID = Payment.userID
        WHERE Payment.userID = ?
        ORDER BY Payment.created DESC
        LIMIT 12
    `, [userID]);

    const invoices = payments.map(payment => {
        return {
            id: `INV100${payment.id}`,
            email: payment.email,
            amount: payment.amount,
            custom1: payment.custom1,
            custom2: payment.custom2,
            custom3: payment.custom3,
            created: payment.created
        }
    });

    return res.status(200).json({invoices});
});