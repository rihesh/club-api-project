const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');

// Register a device push token
router.post('/register', NotificationController.registerToken);

// Fetch notification history
router.get('/history', NotificationController.getHistory);

// Admin: Send push notification to all devices for an app (protected -- add auth middleware in future)
router.post('/send', NotificationController.sendToApp);

// Quick Remote DB Sync for push_tokens table 
router.get('/sync-db', async (req, res) => {
    try {
        const { PushToken } = require('../models');
        await PushToken.sync({ alter: true });
        res.json({ message: 'PushToken table synced successfully on remote DB!' });
    } catch (error) {
        console.error('Remote sync error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
