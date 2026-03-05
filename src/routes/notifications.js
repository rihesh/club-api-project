const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');

// Register a device push token
router.post('/register', NotificationController.registerToken);

// Fetch notification history
router.get('/history', NotificationController.getHistory);

// Admin: Send push notification to all devices for an app (protected -- add auth middleware in future)
router.post('/send', NotificationController.sendToApp);

// Quick Remote DB Sync for notification_messages table 
router.get('/sync-db-v2', async (req, res) => {
    try {
        const { NotificationMsg } = require('../models');
        await NotificationMsg.sync({ alter: true });
        res.json({ message: 'NotificationMsg table synced successfully on remote DB!' });
    } catch (error) {
        console.error('Remote sync error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
