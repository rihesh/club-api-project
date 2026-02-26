const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('./src/config/database');

async function fixSchema() {
    try {
        const query = `
      ALTER TABLE users
      ADD COLUMN status ENUM('0','1') DEFAULT '1',
      ADD COLUMN created_date DATETIME DEFAULT NULL,
      MODIFY COLUMN address VARCHAR(100) DEFAULT '',
      MODIFY COLUMN phone VARCHAR(15) DEFAULT '',
      MODIFY COLUMN hospital_id INT DEFAULT 0,
      MODIFY COLUMN forgot_token VARCHAR(400) DEFAULT '',
      MODIFY COLUMN profile_image VARCHAR(200) DEFAULT '',
      MODIFY COLUMN auth_token VARCHAR(200) DEFAULT '',
      MODIFY COLUMN device_token VARCHAR(200) DEFAULT '',
      MODIFY COLUMN device_type VARCHAR(15) DEFAULT '';
    `;
        await sequelize.query(query);
        console.log("Schema updated successfully.");
    } catch (error) {
        console.error("Error updating schema:", error);
    } finally {
        process.exit();
    }
}

fixSchema();
