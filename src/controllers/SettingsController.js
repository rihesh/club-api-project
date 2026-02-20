const { AppSettings, User, sequelize } = require('../models');

const SettingsController = {
    // Get Settings for Admin
    getSettings: async (req, res) => {
        try {
            let user_id = req.query.user_id;
            const { app_id } = req.params;

            // Handle Mobile App Request (app_id in params)
            if (app_id) {
                console.log(`[SettingsController] Received app_id: ${app_id}`);

                // Try to find user by app_id
                const user = await User.findOne({ where: { app_id } });

                if (user) {
                    user_id = user.user_id;
                    console.log(`[SettingsController] Mapped app_id '${app_id}' to user_id: ${user_id}`);
                } else if (!isNaN(app_id)) {
                    // Fallback to direct ID if numeric
                    user_id = app_id;
                } else if (app_id === 'jerry_app') {
                    // Legacy fallback if DB lookup fails (though DB should have it)
                    user_id = 1;
                }
            }

            console.log(`[SettingsController] Resolved user_id: ${user_id}`);

            if (!user_id) return res.status(400).json({ success: false, message: 'User ID required' });

            let settings = await AppSettings.findOne({ where: { user_id } });
            console.log(`[SettingsController] Found settings:`, settings ? settings.toJSON() : 'null');

            // Return default structure if no settings found
            if (!settings) {
                settings = {
                    primary_color: '#000000',
                    secondary_color: '#ffffff',
                    background_color: '#f5f5f5',
                    text_color: '#000000',
                    logo_url: '',
                    event_name: 'My Event',
                    subtitle: 'Annual Conference',
                    description: 'Welcome to the event app.',
                    statusbar_color: '#000000',
                    slider_images: [],
                    social_links: { facebook: '', twitter: '' }
                };
            }

            res.json({ success: true, settings });
        } catch (error) {
            console.error('Error fetching settings:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    // Save Settings
    saveSettings: async (req, res) => {
        try {
            const {
                user_id,
                primary_color,
                secondary_color,
                background_color,
                text_color,
                logo_url,
                // New Fields
                event_name,
                subtitle,
                description,
                statusbar_color,
                slider_images,
                social_links
            } = req.body;

            if (!user_id) return res.status(400).json({ success: false, message: 'User ID required' });

            let settings = await AppSettings.findOne({ where: { user_id } });

            const data = {
                user_id,
                primary_color,
                secondary_color,
                background_color,
                text_color,
                logo_url,
                event_name,
                subtitle,
                description,
                statusbar_color,
                slider_images,
                social_links
            };

            if (settings) {
                await settings.update(data);
            } else {
                await AppSettings.create(data);
            }

            res.json({ success: true, message: 'Settings saved successfully' });
        } catch (error) {
            console.error('Error saving settings:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    }
};

module.exports = SettingsController;
