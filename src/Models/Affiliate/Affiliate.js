import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class AffiliateClick {

    static async getUnpaidAffiliatePayments() {
        const query = `
        SELECT AffiliatePayments.unpaid, User.*
        FROM User
        JOIN (
            SELECT SUM(Payment.amount)*0.3 as unpaid, Affiliate.affiliateID
            FROM Payment
            JOIN User
                ON Payment.userID = User.ID
            JOIN User as Affiliate
                ON User.affiliateRef = Affiliate.affiliateID
            WHERE Payment.hasPaidAffiliate = 0
                AND User.affiliateRef IS NOT NULL
                AND User.affiliateRef != ""
            GROUP BY Affiliate.affiliateID
            HAVING unpaid >= 30
        ) as AffiliatePayments
            ON User.affiliateID = AffiliatePayments.affiliateID 
        LEFT JOIN AffiliateMessage
            ON AffiliateMessage.userID = User.id
        WHERE (AffiliateMessage.id IS NULL
            OR AffiliateMessage.type != 'ban')
            AND User.affiliatePayPal IS NOT NULL
        ORDER BY AffiliatePayments.unpaid DESC
        `;
        return DatabaseModel.awaitableQuery(query);
    }

    static async markAffiliatePaymentsAsPaid(affiliateID) {
        const query = `
            UPDATE Payment
            JOIN User as customer
                ON customer.id = Payment.userID
            JOIN User as affiliate
                ON affiliate.affiliateID = customer.affiliateRef
            SET Payment.hasPaidAffiliate = 1
            WHERE affiliate.affiliateID = ?
        `;
        return DatabaseModel.awaitableQuery(query, [affiliateID]);
    }
}