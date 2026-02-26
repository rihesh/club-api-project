const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('./src/config/database');

async function getUsers() {
  try {
    const users = await sequelize.query("SELECT * FROM users LIMIT 5", { type: QueryTypes.SELECT });
    console.log(users);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
getUsers();
