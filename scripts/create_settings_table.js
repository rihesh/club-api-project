const sequelize = require('../src/config/database');

async function createTable() {
    try {
        await sequelize.authenticate();
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS app_settings (
                setting_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                app_name VARCHAR(100),
                primary_color VARCHAR(20) DEFAULT '#000000',
                secondary_color VARCHAR(20) DEFAULT '#ffffff',
                background_color VARCHAR(20) DEFAULT '#f5f5f5',
                text_color VARCHAR(20) DEFAULT '#000000',
                logo_url VARCHAR(255),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `);
        console.log("Table app_settings created successfully");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

createTable();
