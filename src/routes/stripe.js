const express = require('express');
const router = express.Router();
const StripeController = require('../controllers/StripeController');

// App Admin endpoints
router.post('/onboard', StripeController.createAccountLink);
router.get('/status', StripeController.getAccountStatus);

// Mobile App endpoint
router.post('/create-payment-intent', StripeController.createPaymentIntent);

// Server Webhook endpoint (Requires raw body processing)
router.post('/webhook', express.raw({ type: 'application/json' }), StripeController.webhook);

module.exports = router;
