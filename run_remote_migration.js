const mysql = require('mysql2/promise');

async function migrate() {
    try {
        const connection = await mysql.createConnection({
            host: 'shuttle.proxy.rlwy.net',
            port: 32461,
            user: 'root',
            password: 'gOncLeATQDpZNMtfqsPagRPupCeuBOJp',
            database: 'railway',
            ssl: { rejectUnauthorized: false },
            connectTimeout: 30000
        });

        console.log("Connected to Railway MySQL!");

        try {
            await connection.query(`ALTER TABLE functions ADD COLUMN is_highlighted ENUM('0', '1') DEFAULT '0';`);
            console.log("Added is_highlighted column.");
        } catch(e) { console.log("functions column might exist:", e.message); }

        try {
            await connection.query(`ALTER TABLE bookings ADD COLUMN customer_email VARCHAR(255) DEFAULT NULL;`);
            console.log("Added customer_email column.");
        } catch(e) { console.log("bookings column might exist:", e.message); }

        await connection.end();
        console.log("Migration successful!");
    } catch (e) {
        console.error("Migration Failed:", e.message);
    }
}
migrate();
