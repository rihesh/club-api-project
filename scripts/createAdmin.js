const sequelize = require('../src/config/database');
const crypto = require('crypto');
const { QueryTypes } = require('sequelize');

async function createAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const username = 'admin';
        const password = 'password123';
        const md5Password = crypto.createHash('md5').update(password).digest('hex');

        // Check if exists
        const [existing] = await sequelize.query("SELECT * FROM users WHERE user_name = ?", {
            replacements: [username],
            type: QueryTypes.SELECT
        });

        if (existing) {
            console.log('Admin user already exists.');
            // Update password just in case
            await sequelize.query("UPDATE users SET password = ? WHERE user_id = ?", {
                replacements: [md5Password, existing.user_id]
            });
            console.log('Admin password updated to: password123');
        } else {
            /* 
              Table structure for `users`:
              user_id, name, user_name, password, email, status, gcm_key, phone
            */
            await sequelize.query(`
                INSERT INTO users (name, user_name, password, email, status, phone, user_type, hospital_id, app_id, forgot_token, profile_image, auth_token, device_token, device_type, address)
                VALUES ('Super Admin', ?, ?, 'admin@test.com', '1', '1234567890', 1, 0, '0', '', '', '', '', '', 'Admin Address')
            `, {
                replacements: [username, md5Password]
            });
            console.log('Admin user created. Username: admin, Password: password123');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
