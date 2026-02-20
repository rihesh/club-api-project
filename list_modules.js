const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('./src/config/database');

async function listAll() {
    try {
        const all = await sequelize.query(
            "SELECT function_id, function_name FROM functions",
            { type: QueryTypes.SELECT }
        );
        console.log(JSON.stringify(all, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
}
listAll();
