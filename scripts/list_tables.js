const sequelize = require('../src/config/database');

async function listTables() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SHOW TABLES");
        console.log(results);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

listTables();
