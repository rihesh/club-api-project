const sequelize = require('../src/config/database');

async function fix() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        // Fix 'fields' column
        await sequelize.query("ALTER TABLE function_fields MODIFY COLUMN fields TEXT NULL");
        console.log("Modified 'fields' column to allow NULL");

        // Fix 'extras' column
        await sequelize.query("ALTER TABLE function_fields MODIFY COLUMN extras TEXT NULL");
        console.log("Modified 'extras' column to allow NULL");

    } catch (error) {
        console.error('Error modifying columns:', error.message);
    } finally {
        await sequelize.close();
    }
}

fix();
