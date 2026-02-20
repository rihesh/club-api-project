const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('./src/config/database');

async function proposeRemapping() {
    try {
        const functions = await sequelize.query(
            "SELECT function_id, function_name FROM functions ORDER BY function_order ASC, function_id ASC",
            { type: QueryTypes.SELECT }
        );

        console.log("Proposed Mapping:");
        const mapping = {};
        let newId = 1;
        for (const f of functions) {
            mapping[f.function_id] = newId++;
            console.log(`${f.function_id} -> ${mapping[f.function_id]} (${f.function_name})`);
        }

        console.log("\nCritical IDs Mapping:");
        if (mapping[7]) console.log(`Sponsors (7) -> ${mapping[7]}`);
        if (mapping[70]) console.log(`Sponsors (70) -> ${mapping[70]}`);
        if (mapping[26]) console.log(`Gallery (26) -> ${mapping[26]}`);
        if (mapping[27]) console.log(`Video (27) -> ${mapping[27]}`);

    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
}
proposeRemapping();
