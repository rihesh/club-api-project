const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('./src/config/database');

async function testCreateUser() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");

    await sequelize.query(
      `INSERT INTO users (user_name, password, email, name, app_id, user_type, status, created_date) 
         VALUES (:user_name, :password, :email, :name, :app_id, :user_type, '1', NOW())`,
      {
        replacements: {
          user_name: 'testuser123',
          password: 'hash',
          email: 'test@test.com',
          name: 'Test',
          app_id: '',
          user_type: 2
        },
        type: QueryTypes.INSERT
      }
    );
    console.log("Success");
  } catch (error) {
    console.error("Error creating user:", error);
  } finally {
    process.exit();
  }
}

testCreateUser();
