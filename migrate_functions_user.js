const mysql = require('mysql2/promise');

async function migrate_local() {
    try {
        const sequelize = require('./src/config/database');
        await sequelize.query(`ALTER TABLE functions_user ADD COLUMN IF NOT EXISTS is_highlighted ENUM('0', '1') DEFAULT '0';`);
        await sequelize.query(`ALTER TABLE functions_user ADD COLUMN IF NOT EXISTS function_order INT DEFAULT 0;`);
        console.log("Local DB updated.");
    } catch(e) { console.log("Local DB Error/Exists", e.message); }
}

async function migrate_remote() {
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
        
        try {
            await connection.query(`ALTER TABLE functions_user ADD COLUMN is_highlighted ENUM('0', '1') DEFAULT '0';`);
            console.log("Remote DB added is_highlighted");
        } catch(e) { console.log("Remote DB Error/Exists", e.message); }

        try {
            await connection.query(`ALTER TABLE functions_user ADD COLUMN function_order INT DEFAULT 0;`);
            console.log("Remote DB added function_order");
        } catch(e) { console.log("Remote DB Error/Exists", e.message); }
        
        await connection.end();
    } catch(e) {
        console.error("Remote Connection Failed", e.message);
    }
}

migrate_local().then(migrate_remote);
