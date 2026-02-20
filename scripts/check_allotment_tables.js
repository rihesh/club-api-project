const sequelize = require('../src/config/database');

async function check() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('--- alloted_functions ---');
        const [afCols] = await sequelize.query("SHOW COLUMNS FROM alloted_functions");
        console.log('Columns:', afCols.map(c => c.Field));
        const [afData] = await sequelize.query("SELECT * FROM alloted_functions LIMIT 5");
        console.log('Data:', afData);

        console.log('\n--- functions_user ---');
        const [fuCols] = await sequelize.query("SHOW COLUMNS FROM functions_user");
        console.log('Columns:', fuCols.map(c => c.Field));
        const [fuData] = await sequelize.query("SELECT * FROM functions_user LIMIT 5");
        console.log('Data:', fuData);

    } catch (e) { console.error(e); } finally { sequelize.close(); }
}
check();
