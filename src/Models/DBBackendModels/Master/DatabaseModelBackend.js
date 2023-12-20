let pool;
if (typeof window === 'undefined'){ pool = require('~/src/Models/DBBackendModels/Master/DatabaseConnectBackend.js')};

/*
    Allows you to use some handy database methods on models

    For example, you can something like this:

    `Payments.query("Select * FROM Payments")`
    and it will return an array of payment models.

    Or do some shorthand things like

    Payment.find({where: {id: 123}})

*/
export default class DatabaseModelBackend {

    static tableName() {
        throw new Error("DatabaseModel subclass must implement tableName");
    };

    static databaseRowToModel(data) {
        throw new Error("DatabaseModel subclass mus implement databaseRowToModel");
    }

    /* 
        Executes SQL and turns rows into a class instances.
        @returns: array of DatabaseModel instances
    */
    static async query(query, queryValues) {
        const results = await this.awaitableQuery(query, queryValues);
        // For select statement, convert rows into models
        if (Array.isArray(results)) {
            const models = [];
            if (results.length) {
                for (const row of results) {
                    models.push(this.databaseRowToModel(row))
                }
            }
            return models;
        } else {
        // For everything else, return results
            return results;
        }
    }

    /* See `find` */
    static async findOne({where, orderBy}) {
        try {
            const result = await this.find({where: where, orderBy: orderBy, limit: 1});
            if (!result?.length) {
                return null;
            }
            return result[0];
        } catch(error) {
            throw error; // Bubble up
        }
    }

    /*
        Finds one row that matches the provided params.

        Example 1:
            @Params: find({where: {id: 123}})
            @Return: Returns row where id = 123
        
        Example 2:
            @Params: find({where: {credits: '> 123'}, limit: 1})
            @Return: Returns 1 row where credits > 123

        Example 3:
            @Params: find({where: {id: 123}, orderBy: {fieldName: 'created', direction: 'DESC'}})
            @Return: Returns row where id = 123
    */
    static async find({where = {}, limit, orderBy}) {
        let queryValues = [], whereConditions = [];

        for (const [fieldName, value] of Object.entries(where)) {
            const isSpecialValue = ['>', '<', '>=', '<='].find(match => typeof value == "string" && value.includes(match));
            if (isSpecialValue) {
                whereConditions.push(`${this.tableName()}.${fieldName} ${value}`);
            } else {
                whereConditions.push(`${this.tableName()}.${fieldName} = ?`);
                queryValues.push(value);
            }
        }
        whereConditions = whereConditions.join(" AND ");

        if (limit) {
            queryValues.push(limit);
        }

        const query = `
            SELECT *
            FROM ${this.tableName()} 
            ${whereConditions.length ? `WHERE ${whereConditions} ` : ``}
            ${orderBy? `ORDER BY ${orderBy.fieldName} ${orderBy.direction}` : ''}
            ${limit ? 'LIMIT ?' : ''}
        `;

        return this.query(query, queryValues);
    }

    /*
        Updates a row with a given id with the passed in params.

        Example:
        update({subscriptionID: '12343, email: 'test@gmail.com'}, 5);
    */
    static async update(setParams, id) {
        const setValues = Object.values(setParams), tmp = [];
        for (const fieldName in setParams) {
            tmp.push(`${fieldName} = ?`);
        }
        const setQuery = tmp.join(", ");

        const query = `UPDATE ${this.tableName()} SET ${setQuery} WHERE id = ?`;
        const queryValues = [...setValues, id];
        return this.awaitableQuery(query, queryValues);
    }

    static async delete({where = {}}) {
        let queryValues = [], whereConditions = [];

        for (const [fieldName, value] of Object.entries(where)) {
            const isSpecialValue = ['>', '<', '>=', '<='].find(match => typeof value == "string" && value.includes(match));
            if (isSpecialValue) {
                whereConditions.push(`${this.tableName()}.${fieldName} ${value}`);
            } else {
                whereConditions.push(`${this.tableName()}.${fieldName} = ?`);
                queryValues.push(value);
            }
        }
        whereConditions = whereConditions.join(" AND ");
        
        if (!whereConditions.length) {
            throw new Error("Must specifiy where condition in delete");
        }

        const query = `DELETE FROM ${this.tableName()} ${whereConditions.length ? `WHERE ${whereConditions} ` : ``}`;
        return this.awaitableQuery(query, queryValues);
    }

    /*
        =========== Helper ============
    */

    static async awaitableQuery(query, queryValues = []) {
        return new Promise((resolve, reject) => {
            pool.query(query, queryValues, function(err, results) {
                if (err) return reject(err);
                return resolve(results);
            });
        });
    }
}