const sequelize = require('../src/config/database');

async function migrate() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();

        console.log('Adding customer_email to bookings...');
        try {
            await sequelize.query("ALTER TABLE bookings ADD COLUMN customer_email VARCHAR(255) NULL;");
            console.log('customer_email added.');
        } catch (e) {
            console.log('Column might already exist:', e.message);
        }

        console.log('Adding is_highlighted to functions...');
        try {
            await sequelize.query("ALTER TABLE functions ADD COLUMN is_highlighted ENUM('0', '1') DEFAULT '0';");
            console.log('is_highlighted added.');
        } catch (e) {
            console.log('Column might already exist:', e.message);
        }

        console.log('Migration complete.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

migrate();
