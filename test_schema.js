const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('./src/config/database');

async function checkSchema() {
    try {
        const tableInfo = await sequelize.query('DESCRIBE users;', { type: QueryTypes.SELECT });
        console.log(tableInfo);
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkSchema();
