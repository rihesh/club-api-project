const { AppSettings } = require('../src/models');
const sequelize = require('../src/config/database');

async function verifyData() {
    try {
        const settings = await AppSettings.findOne({ where: { user_id: 1 } });
        console.log("Settings for user 1:", JSON.stringify(settings, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

verifyData();
