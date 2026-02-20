const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('./src/config/database');

async function checkUsers() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const users = await sequelize.query("SELECT user_id, user_name, user_type FROM users", { type: QueryTypes.SELECT });
        console.log("Users:", JSON.stringify(users, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkUsers();
