const sequelize = require('../src/config/database');

async function setAppId() {
    try {
        await sequelize.authenticate();
        await sequelize.query("UPDATE users SET app_id = 'jerry_app' WHERE user_name = 'jerry'");
        console.log("Updated jerry's app_id to 'jerry_app'");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

setAppId();
