const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function updateSchema() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('app_settings');

        // Define fields to add
        const fields = [
            { name: 'event_name', type: DataTypes.STRING(255) },
            { name: 'subtitle', type: DataTypes.STRING(255) },
            { name: 'description', type: DataTypes.TEXT },
            { name: 'statusbar_color', type: DataTypes.STRING(20), defaultValue: '#000000' },
            { name: 'slider_images', type: DataTypes.JSON },
            { name: 'social_links', type: DataTypes.JSON }
        ];

        for (const field of fields) {
            if (!tableInfo[field.name]) {
                console.log(`Adding column: ${field.name}`);
                await queryInterface.addColumn('app_settings', field.name, {
                    type: field.type,
                    allowNull: true,
                    defaultValue: field.defaultValue
                });
            } else {
                console.log(`Column ${field.name} already exists.`);
            }
        }

        console.log('Schema update completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

updateSchema();
