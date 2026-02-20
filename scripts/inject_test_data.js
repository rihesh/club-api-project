const { AppSettings } = require('../src/models');
const sequelize = require('../src/config/database');

async function injectLegacyData() {
    try {
        // Find settings for user_id 1 (default test user)
        let settings = await AppSettings.findOne({ where: { user_id: 1 } });

        if (!settings) {
            console.log("No settings found for user 1, creating...");
            settings = await AppSettings.create({ user_id: 1 });
        }

        // Update with legacy-style data
        await settings.update({
            event_name: 'Legacy Tech Summit 2026',
            subtitle: 'Innovating the Future',
            description: '<p>Welcome to the biggest tech event of the year.</p>',
            statusbar_color: '#4a0072' // Darker shade of purple
        });

        console.log("Legacy data injected successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error injecting data:", error);
        process.exit(1);
    }
}

injectLegacyData();
