const sequelize = require('../src/config/database');

async function addInstructionsColumn() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        await sequelize.query("ALTER TABLE function_fields ADD COLUMN instructions TEXT NULL");
        console.log('Added instructions column to function_fields table.');

    } catch (error) {
        console.error('Error adding column:', error.message);
    } finally {
        await sequelize.close();
    }
}

addInstructionsColumn();
