const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('./src/config/database');

async function findSponsors() {
    try {
        const sponsors = await sequelize.query(
            "SELECT function_id, function_name, category FROM functions WHERE function_name LIKE '%Sponsor%'",
            { type: QueryTypes.SELECT }
        );
        console.log(JSON.stringify(sponsors, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
}
findSponsors();
