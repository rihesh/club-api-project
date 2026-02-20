const express = require('express');
const router = express.Router();
const StripeController = require('../controllers/StripeController');

// App Admin endpoints
router.post('/onboard', StripeController.createAccountLink);
router.get('/status', StripeController.getAccountStatus);

// Mobile App endpoint
router.post('/create-payment-intent', StripeController.createPaymentIntent);

module.exports = router;
