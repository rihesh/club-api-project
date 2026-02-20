const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('./src/config/database');
const ApiController = require('./src/controllers/ApiController');

// MOCKING REQUEST/RESPONSE for testing ApiController
const req = { params: { module_id: 20 }, query: { app_id: 'jerry_app' } };
const res = {
    json: (data) => console.log(JSON.stringify(data, null, 2)),
    status: (code) => ({ json: (data) => console.log(`Status ${code}:`, data) })
};

async function checkSpeakerData() {
    try {
        console.log("Fetching Speaker List...");
        // We can't easily call controller directly without full req/res mock or refactoring.
        // Let's just query DB directly to see values.

        const content = await sequelize.query(
            "SELECT * FROM functions_allot WHERE function_id = 20 AND status = '1' LIMIT 1",
            { type: QueryTypes.SELECT }
        );

        if (content.length > 0) {
            const item = content[0];
            console.log("Speaker Item:", item);

            const values = await sequelize.query(
                `SELECT * FROM field_values WHERE function_allot_id = ${item.function_allot_id}`,
                { type: QueryTypes.SELECT }
            );
            console.log("Field Values:", values);
        } else {
            console.log("No speakers found.");
        }

    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
}
checkSpeakerData();
