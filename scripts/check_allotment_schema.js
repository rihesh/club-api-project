const sequelize = require('../src/config/database');

async function checkAllotmentAndAppModules() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        const [allotColumns] = await sequelize.query("SHOW COLUMNS FROM functions_allot");
        console.log('functions_allot Columns:', allotColumns.map(c => c.Field));

        // Check if there is an 'app_modules' or 'user_functions' table
        const [tables] = await sequelize.query("SHOW TABLES");
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log('Tables:', tableNames);

        if (tableNames.includes('app_modules')) {
            const [appModColumns] = await sequelize.query("SHOW COLUMNS FROM app_modules");
            console.log('app_modules Columns:', appModColumns.map(c => c.Field));
        }

    } catch (e) {
        console.error(e);
    } finally {
        sequelize.close();
    }
}

checkAllotmentAndAppModules();
