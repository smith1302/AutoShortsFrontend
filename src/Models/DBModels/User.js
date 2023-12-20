import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';
import Subscription from '~/src/Models/DBModels/Subscription';
import Plan from '~/src/Models/DBModels/Plan';
import { SubscriptionStatus, SubscriptionSource, RegisterSource } from '~/src/enums';

export default class User extends DatabaseModel {

    constructor({
        id, 
        email, 
        hashedPassword, // md5 hash
        IP, 
        source,
        stripeCustomerID, 
        subscriptionID, 
        master, 
        affiliateRef, 
        affiliateID, 
        affiliatePayPal, 
        referralURL, 
        referralQueryParams, 
        country, 
        sessionKey // To manage user seats
    }) {
        super();
        this.id = id;
        this.email = email;
        this.hashedPassword = hashedPassword;
        this.IP = IP;
        this.source = source;
        this.country = country;
        this.master = master;
        this.stripeCustomerID = stripeCustomerID;
        this.subscriptionID = subscriptionID;
        this.affiliateRef = affiliateRef;
        this.affiliatePayPal = affiliatePayPal;
        this.affiliateID = affiliateID;
        this.referralURL = referralURL;
        this.referralQueryParams = referralQueryParams;
        this.sessionKey = sessionKey;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new User({
            id: data.id,
            email: data.email,
            hashedPassword: data.password,
            IP: data.IP,
            source: data.source,
            country: data.country,
            stripeCustomerID: data.stripeCustomerID,
            subscriptionID: data.subscriptionID,
            affiliatePayPal: data.affiliatePayPal,
            affiliateID: data.affiliateID,
            affiliateRef: data.affiliateRef,
            referralURL: data.referralURL,
            referralQueryParams: data.referralQueryParams,
            sessionKey: data.sessionKey,
            master: data.master
        });
    }

    static tableName() {
        return "User";
    }

    /* ==== DB Helpers ==== */

    static async create({email, hashedPassword, IP, source='manual', affiliateRef=null, referralURL=null, referralQueryParams=null, country=null}) {
        const apiKey = require('crypto').randomBytes(32).toString('hex');
        const query = `
            INSERT INTO ${this.tableName()}
            (email, password, IP, apiKey, source, affiliateRef, referralURL, referralQueryParams, country)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [email, hashedPassword, IP, apiKey, source, affiliateRef, referralURL, referralQueryParams, country];
        const response = await this.query(query, params);
        return response.insertId;
    }

    static async usersWithRecentMatchingIP({IP}) {
        const query = `
            SELECT *
            FROM ${this.tableName()}
            WHERE User.created >= NOW() - INTERVAL 1 DAY
                AND IP = ?
                AND IP != ''
        `;
        return this.query(query, [IP]);
    }

    static async getSubscription(userID) {
        return Subscription.getUserSubscription(userID);
    }

    static async getPlan(userID) {
        const subscription = await this.getSubscription(userID);
        return Plan.findOne({where: {id: subscription.planID}});
    }

    /* 
        PayPal doesn't send an event when a subscription has passed its current period end.
        So we check and terminate it manually. We also have a cron job, but this is just incase.
    */
    static async terminatePayPalSubscriptionCheck(userID) {
        try {
            const pendingTerminations = await Subscription.query(`
                SELECT *
                FROM ${Subscription.tableName()}
                WHERE NOW() > currentPeriodEnd
                AND (
                        status = "${SubscriptionStatus.CANCELED}"
                        OR status = "${SubscriptionStatus.ACTIVE}"
                    )
                AND dateTerminated IS NULL
                AND source = "${SubscriptionSource.PayPal}"
                AND userID = ?
            `, [userID]);

            for (const pendingTermination of pendingTerminations) {
                const userID = pendingTermination.userID;
                // Terminate the subscription
                let query = `UPDATE ${Subscription.tableName()} SET dateTerminated = NOW(), dateCanceled = IF(dateCanceled IS NULL, NOW(), dateCanceled), status = 'canceled' WHERE id = ?`;
                await Subscription.query(query, [pendingTermination.id]);
                // Switch user from this deleted plan back to the free plan.
                query = `UPDATE ${User.tableName()} SET subscriptionID = freeSubscriptionID WHERE id = ? AND subscriptionID = ?`;
                await User.query(query, [userID, pendingTermination.id]);
            }
        } catch (err) {
            console.log(`terminatePayPalSubscriptionCheck failed:`, err.message);
        }
    }
}