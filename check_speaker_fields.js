const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('./src/config/database');

async function getSpeakerFields() {
    try {
        // Check module name for ID 20
        const [module] = await sequelize.query(
            "SELECT * FROM functions WHERE function_id = 20",
            { type: QueryTypes.SELECT }
        );
        console.log("Module:", module ? module.function_name : "Not Found");

        // Get Fields
        const fields = await sequelize.query(
            "SELECT * FROM function_fields WHERE function_id = 20 ORDER BY field_order ASC",
            { type: QueryTypes.SELECT }
        );
        console.log("Fields:", JSON.stringify(fields, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
}
getSpeakerFields();
