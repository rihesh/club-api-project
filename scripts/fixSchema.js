const sequelize = require('../src/config/database');

async function fixSchema() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        // Resize password column to 255 chars
        try { await sequelize.query("ALTER TABLE users MODIFY password VARCHAR(255)"); } catch (e) { console.log('Password resize skipped/failed'); }

        // Fix functions_allot columns to allow NULL
        try {
            await sequelize.query("ALTER TABLE functions_allot MODIFY COLUMN event_date DATE NULL");
            console.log('Modified event_date to allow NULL');
        } catch (e) { console.log('event_date modification failed', e.message); }

        try {
            await sequelize.query("ALTER TABLE functions_allot MODIFY COLUMN time_from TIME NULL");
            console.log('Modified time_from to allow NULL');
        } catch (e) { console.log('time_from modification failed', e.message); }

        try {
            await sequelize.query("ALTER TABLE functions_allot MODIFY COLUMN count INT DEFAULT 0");
            console.log('Modified count to have DEFAULT 0');
        } catch (e) { console.log('count modification failed', e.message); }

        try {
            await sequelize.query("ALTER TABLE functions_allot MODIFY COLUMN user_types VARCHAR(250) DEFAULT ''");
            console.log('Modified user_types to have DEFAULT ""');
        } catch (e) { console.log('user_types modification failed', e.message); }

        process.exit(0);
    } catch (error) {
        console.error('Error fixing schema:', error);
        process.exit(1);
    }
}

fixSchema();
