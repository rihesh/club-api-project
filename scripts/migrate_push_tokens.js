// Run this script to create the push_tokens table in the database
// Usage: node scripts/migrate_push_tokens.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../src/config/database');
const PushToken = require('../src/models/PushToken');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Sync only the PushToken model (creates table if not exists)
        await PushToken.sync({ alter: true });
        console.log('✅ push_tokens table created/updated successfully');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
