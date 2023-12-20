import DatabaseModel from '~/src/Models/DBModels/DatabaseModel';

export default class UserCost extends DatabaseModel {

    constructor({ userID, inputWords, outputWords, cost }) {
        super();
        this.userID = userID;
        this.inputWords = inputWords;
        this.outputWords = outputWords;
        this.cost = cost;
    }

    /* ==== DatabaseModel overrides ==== */

    static databaseRowToModel(data) {
        return new UserCost({
            userID: data.userID,
            inputWords: data.inputWords,
            outputWords: data.outputWords,
            cost: data.cost
        });
    }

    static tableName() {
        return "UserCost";
    }

    /* ==== DB Helpers ==== */

    static async insertOrUpdate({userID, inputWords, outputWords, cost}) {
        try {
            const query = `
                INSERT INTO ${this.tableName()}
                (userID, inputWords, outputWords, cost) VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                inputWords = inputWords + VALUES(inputWords),
                outputWords = outputWords + VALUES(outputWords),
                cost = cost + VALUES(cost),
                updated = NOW()
            `;
            let roundedCost = parseFloat(cost.toFixed(5))
            const queryValues = [userID, inputWords, outputWords, roundedCost];
            await this.query(query, queryValues);
        } catch (err) {
            console.log(`Error saving cost`);
            console.log(err);
        }
    }
}