const sequelize = require('./src/config/database');
const { QueryTypes } = require('sequelize');

async function migrate() {
    try {
        console.log("Connecting to database...");
        await sequelize.authenticate();

        console.log("Adding home_layout column to app_settings...");
        await sequelize.query(`
            ALTER TABLE app_settings 
            ADD COLUMN home_layout VARCHAR(50) DEFAULT 'classic'
        `, { type: QueryTypes.RAW });

        console.log("Migration completed successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await sequelize.close();
    }
}

migrate();
