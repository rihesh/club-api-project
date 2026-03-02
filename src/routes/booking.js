const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/BookingController');

// Get ticket tiers for an event
router.get('/tiers/:event_id', BookingController.getTiers);

// Get booked seats for an event (optionally filtered by tier)
router.get('/seats/:event_id/:tier_id', BookingController.getBookedSeats);
router.get('/seats/:event_id', BookingController.getBookedSeats);

// Create payment intent (saves a pending booking)
router.post('/create-payment-intent', BookingController.createPaymentIntent);

// Confirm booking after payment success
router.post('/confirm', BookingController.confirmBooking);

// Download PDF ticket
router.get('/ticket/:booking_id', BookingController.downloadTicket);

// Get all bookings by mobile number (customer's own bookings)
router.get('/my/:mobile', BookingController.myBookings);

// List bookings for an event (admin)
router.get('/list/:event_id', BookingController.listBookings);

// Save/update ticket tiers for an event (admin)
router.post('/tiers', BookingController.saveTiers);

module.exports = router;
