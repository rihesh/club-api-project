const sequelize = require('../src/config/database');
const { QueryTypes } = require('sequelize');

async function findAppId() {
    try {
        await sequelize.authenticate();
        const results = await sequelize.query("SELECT * FROM users WHERE user_name = 'jerry'", { type: QueryTypes.SELECT });
        console.log(results);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

findAppId();
