const mysql = require('mysql2/promise');

const env = process.env;

// Create a MySQL connection pool
const db = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    connectionLimit: 10 // adjust the value as per your requirements
});

db.on('acquire', (connection) => {
    console.log('Connection %d acquired', connection.threadId);
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    connection.release();
    console.log('Connected to the database');
});

module.exports = db;

