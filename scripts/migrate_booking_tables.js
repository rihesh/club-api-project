/**
 * Migration: Create bookings and ticket_tiers tables in Railway MySQL
 * Run: node scripts/migrate_booking_tables.js
 */
require('dotenv').config();
const sequelize = require('../src/config/database');

async function migrate() {
    console.log('🔌 Connecting to Railway MySQL...');
    await sequelize.authenticate();
    console.log('✅ Connected!\n');

    // Create ticket_tiers table
    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS ticket_tiers (
            tier_id INT AUTO_INCREMENT PRIMARY KEY,
            function_allot_id INT NOT NULL,
            tier_name VARCHAR(100) NOT NULL,
            price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            total_seats INT NOT NULL DEFAULT 100,
            seats_booked INT NOT NULL DEFAULT 0,
            color VARCHAR(20) DEFAULT NULL,
            description VARCHAR(255) DEFAULT NULL,
            status ENUM('1','0') NOT NULL DEFAULT '1',
            INDEX idx_event (function_allot_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ ticket_tiers table ready');

    // Create bookings table
    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS bookings (
            booking_id INT AUTO_INCREMENT PRIMARY KEY,
            function_allot_id INT NOT NULL,
            customer_name VARCHAR(255) NOT NULL,
            customer_mobile VARCHAR(20) NOT NULL,
            ticket_tier_id INT DEFAULT NULL,
            tier_name VARCHAR(100) DEFAULT NULL,
            seat_number VARCHAR(20) DEFAULT NULL,
            quantity INT NOT NULL DEFAULT 1,
            amount_paid DECIMAL(10,2) NOT NULL,
            payment_intent_id VARCHAR(255) DEFAULT NULL,
            payment_status ENUM('pending','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
            booking_reference VARCHAR(50) DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_event (function_allot_id),
            INDEX idx_payment_status (payment_status),
            INDEX idx_booking_ref (booking_reference)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ bookings table ready\n');

    console.log('🎉 Migration complete!');
    process.exit(0);
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
});
