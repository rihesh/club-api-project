const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('./src/config/database');

async function listUserFunctions() {
    try {
        const list = await sequelize.query(
            "SELECT function_id, name, user_id FROM functions_user WHERE name LIKE '%Sponsor%'",
            { type: QueryTypes.SELECT }
        );
        console.log(JSON.stringify(list, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
}
listUserFunctions();
