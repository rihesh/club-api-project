const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('./src/config/database');

async function resequenceModules() {
    const transaction = await sequelize.transaction();
    try {
        // 1. Get current list sorted as desired
        const functions = await sequelize.query(
            "SELECT function_id FROM functions ORDER BY function_order ASC, function_id ASC",
            { type: QueryTypes.SELECT, transaction }
        );

        console.log(`Found ${functions.length} functions to resequence.`);

        // 2. Create Mapping (Old -> New)
        const mapping = {};
        let newIdCounter = 1;
        for (const f of functions) {
            mapping[f.function_id] = newIdCounter++;
        }

        // 3. Temporary Shift (+10000) to avoid collisions
        console.log("Step 1: Shifting IDs to temporary range...");
        for (const f of functions) {
            const oldId = f.function_id;
            const tempId = oldId + 10000;

            await sequelize.query(`UPDATE functions SET function_id = ${tempId} WHERE function_id = ${oldId}`, { transaction });
            await sequelize.query(`UPDATE functions_user SET function_id = ${tempId} WHERE function_id = ${oldId}`, { transaction });
            await sequelize.query(`UPDATE function_fields SET function_id = ${tempId} WHERE function_id = ${oldId}`, { transaction });
            await sequelize.query(`UPDATE functions_allot SET function_id = ${tempId} WHERE function_id = ${oldId}`, { transaction }); // Ensure table name is correct
        }

        // 4. Shift to New IDs
        console.log("Step 2: Shifting IDs to final range...");
        for (const f of functions) {
            const oldId = f.function_id;
            const tempId = oldId + 10000;
            const newId = mapping[oldId];

            await sequelize.query(`UPDATE functions SET function_id = ${newId} WHERE function_id = ${tempId}`, { transaction });
            await sequelize.query(`UPDATE functions_user SET function_id = ${newId} WHERE function_id = ${tempId}`, { transaction });
            await sequelize.query(`UPDATE function_fields SET function_id = ${newId} WHERE function_id = ${tempId}`, { transaction });
            await sequelize.query(`UPDATE functions_allot SET function_id = ${newId} WHERE function_id = ${tempId}`, { transaction });
        }

        await transaction.commit();
        console.log("Resequencing complete!");
        console.log("New ID Mapping:", JSON.stringify(mapping, null, 2));

    } catch (error) {
        await transaction.rollback();
        console.error("Error during resequencing:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

resequenceModules();
