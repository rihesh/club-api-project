const { PushToken } = require('../models');

// Helper: Send push notifications via Expo Push API (no SDK, just fetch — safe for serverless)
const sendExpoPushNotifications = async (tokens, title, body, data = {}) => {
    if (!tokens || tokens.length === 0) return;

    const messages = tokens.map(token => ({
        to: token,
        sound: 'default',
        title,
        body,
        data,
    }));

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages),
        });
        const result = await response.json();
        console.log('[NotificationController] Expo push result:', JSON.stringify(result));
        return result;
    } catch (error) {
        console.error('[NotificationController] Failed to send push notifications:', error);
    }
};

const NotificationController = {
    // Register a device push token
    registerToken: async (req, res) => {
        try {
            const { token, platform, contact_mobile, app_id } = req.body;

            if (!token) {
                return res.status(400).json({ success: false, message: 'Push token is required' });
            }

            // Upsert: update if exists, create if new
            const [record, created] = await PushToken.findOrCreate({
                where: { token },
                defaults: { token, platform: platform || 'ios', contact_mobile, app_id }
            });

            if (!created) {
                // Update existing record with latest info
                await record.update({ platform: platform || record.platform, contact_mobile, app_id });
            }

            console.log(`[NotificationController] Token ${created ? 'registered' : 'updated'}: ${token.substring(0, 30)}...`);

            res.json({ success: true, message: created ? 'Token registered' : 'Token updated' });
        } catch (error) {
            console.error('[NotificationController] Error registering token:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    // Fetch notification history (placeholder - returns empty for now, admin can extend later)
    getHistory: async (req, res) => {
        try {
            // In future, this can query a Notifications table where admin-sent pushes are logged
            // For now, return empty array so mobile doesn't crash
            res.json({
                success: true,
                notifications: [],
                message: 'No notification history available yet'
            });
        } catch (error) {
            console.error('[NotificationController] Error fetching history:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    // Admin: Send push notification to all registered tokens for an app_id
    sendToApp: async (req, res) => {
        try {
            const { app_id, title, body, data } = req.body;

            if (!title || !body) {
                return res.status(400).json({ success: false, message: 'Title and body are required' });
            }

            const whereClause = app_id ? { app_id } : {};
            const records = await PushToken.findAll({ where: whereClause });
            const tokens = records.map(r => r.token);

            if (tokens.length === 0) {
                return res.json({ success: true, message: 'No tokens registered for this app', sent: 0 });
            }

            await sendExpoPushNotifications(tokens, title, body, data || {});

            res.json({ success: true, message: `Notification sent to ${tokens.length} device(s)`, sent: tokens.length });
        } catch (error) {
            console.error('[NotificationController] Error sending push:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    }
};

module.exports = NotificationController;
