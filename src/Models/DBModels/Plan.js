import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';
import globals from '~/src/globals.js';
import { PlanBillingInterval } from '~/src/enums';

export default class Plan extends DatabaseModel {

    constructor({ id, name, billingInterval, price, frequency, available, paypalPlanID, testPayPalPlanID, webEnabled, created }) {
        super();
        this.id = id;
        this.name = name;
        this.billingInterval = billingInterval;
        this.price = price;
        this.frequency = frequency;
        this.available = available;
        this.webEnabled = webEnabled;
        this._paypalPlanID = paypalPlanID;
        this._testPayPalPlanID = testPayPalPlanID;
        this.created = created;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new Plan(data);
    }

    static tableName() {
        return "Plan";
    }

    paypalPlanID() {
        return process.env.USE_PAYPAL_TEST == "1" ? this._testPayPalPlanID : this._paypalPlanID;
    }

    isFree() {
        return this.price == 0;
    }

    async updatePayPalPlanID(planID) {
        const config = process.env.USE_PAYPAL_TEST == "1" ? {testPayPalPlanID: planID} : {paypalPlanID: planID}
        await Plan.update(config, this.id);
    }

    intervalText() {
        switch (this.billingInterval) {
            case PlanBillingInterval.MONTHLY:
                return "per month";
            case PlanBillingInterval.YEARLY:
                return "per year";
            default:
                return "undefined";
        }
    }

    description() {
        let description = `${globals.appName} ${this.name} Plan`;
        return description;
    }
}