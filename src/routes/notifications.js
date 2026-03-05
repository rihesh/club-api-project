const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');

// Register a device push token
router.post('/register', NotificationController.registerToken);

// Fetch notification history
router.get('/history', NotificationController.getHistory);

// Admin: Send push notification to all devices for an app (protected -- add auth middleware in future)
router.post('/send', NotificationController.sendToApp);

module.exports = router;
