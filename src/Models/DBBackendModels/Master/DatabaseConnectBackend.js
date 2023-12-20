import mysql from 'mysql';

const { MYSQL_HOST_BACKEND, MYSQL_USER_BACKEND, MYSQL_PASS_BACKEND, MYSQL_DB_BACKEND } = process.env;

// Pools are useful in managing connections. IE. If a connection goes down
// there is no way to restart the mysql connection. Pools on the other hand 
// will create a new connection if one fails.
// See link for more details:
// https://medium.com/@mhagemann/create-a-mysql-database-middleware-with-node-js-8-and-async-await-6984a09d49f4
var pool = mysql.createPool({
    connectionLimit: 10,
    host: MYSQL_HOST_BACKEND,
    user: MYSQL_USER_BACKEND,
    password: MYSQL_PASS_BACKEND,
    database: MYSQL_DB_BACKEND,
    charset: 'utf8mb4_unicode_ci',
    timezone: 'utc'
});

// This is purely to check the connection and log if there's an error.
// The connection is then released after it's finished
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) connection.release();
    return;
});

module.exports = pool;