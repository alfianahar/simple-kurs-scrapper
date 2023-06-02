const mysql = require('mysql2/promise');

// Create a MySQL connection pool
const sqlConnection = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 10 // adjust the value as per your requirements
});

sqlConnection.on('acquire', (connection) => {
    console.log('Connection %d acquired', connection.threadId);
});

sqlConnection.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    connection.release();
    console.log('Connected to the database');
});

module.exports = sqlConnection;
