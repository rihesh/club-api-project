const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: 'Rihesh@123',
    multipleStatements: true
};

const SQL_FILE_PATH = path.join(__dirname, '../../products_event2.sql');

async function setupDatabase() {
    let connection;
    try {
        console.log('Connecting to MySQL...');
        connection = await mysql.createConnection(DB_CONFIG);

        console.log('Creating database products_event2 if not exists...');
        await connection.query('CREATE DATABASE IF NOT EXISTS products_event2');

        console.log('Switching to products_event2...');
        await connection.query('USE products_event2');

        console.log('Reading SQL dump...');
        const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');

        console.log('Importing data (this may take a moment)...');
        // Remove lines starting with /*! and */ to avoid potential parsing issues with some drivers, 
        // though mysql2 usually handles them. Let's try raw first.
        await connection.query(sqlContent);

        console.log('Database setup complete!');

    } catch (error) {
        console.error('Database setup failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

setupDatabase();
