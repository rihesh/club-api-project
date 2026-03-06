const { FunctionAllot, TicketTier, Booking, FunctionField, FieldValue, AppSettings, User } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const NotificationService = require('../services/NotificationService');
const TicketPDFService = require('../services/TicketPDFService');

/**
 * Generate a short unique booking reference like EVT-2026-A4XZ
 */
function generateBookingRef() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let ref = '';
    for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
    return `EVT-${new Date().getFullYear()}-${ref}`;
}

const BookingController = {

    // ─────────────────────────────────────────────
    // GET /api/booking/tiers/:event_id
    // Returns all active ticket tiers for an event
    // ─────────────────────────────────────────────
    getTiers: async (req, res) => {
        try {
            const { event_id } = req.params;

            const tiers = await TicketTier.findAll({
                where: { function_allot_id: event_id, status: '1' },
                order: [['price', 'ASC']]
            });

            // Also check if event has a flat 'Ticket Amount' field (legacy single-price)
            const event = await FunctionAllot.findByPk(event_id);
            if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

            let flatAmount = null;
            const amountField = await FunctionField.findOne({
                where: { function_id: event.function_id, name: 'Ticket Amount' }
            });
            if (amountField) {
                const valueRecord = await FieldValue.findOne({
                    where: { function_allot_id: event_id, function_field_id: amountField.function_field_id }
                });
                if (valueRecord && valueRecord.value) {
                    const cleaned = valueRecord.value.replace(/[^0-9.]/g, '');
                    flatAmount = parseFloat(cleaned) || null;
                }
            }

            res.json({
                success: true,
                tiers,
                flat_amount: flatAmount,
                has_tiers: tiers.length > 0
            });
        } catch (error) {
            console.error('GetTiers Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ─────────────────────────────────────────────
    // GET /api/booking/seats/:event_id/:tier_id
    // Returns booked seat numbers so UI can block them
    // ─────────────────────────────────────────────
    getBookedSeats: async (req, res) => {
        try {
            const { event_id, tier_id } = req.params;

            const where = { function_allot_id: event_id, payment_status: 'paid' };
            if (tier_id && tier_id !== '0') where.ticket_tier_id = tier_id;

            const bookings = await Booking.findAll({
                where,
                attributes: ['seat_number']
            });

            const bookedSeats = bookings
                .map(b => b.seat_number)
                .filter(Boolean);

            res.json({ success: true, booked_seats: bookedSeats });
        } catch (error) {
            console.error('GetBookedSeats Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ─────────────────────────────────────────────
    // POST /api/booking/create-payment-intent
    // Creates Stripe PaymentIntent and saves pending booking
    // Body: { event_id, tier_id?, seat_number?, quantity, customer_name, customer_mobile, customer_email }
    // ─────────────────────────────────────────────
    createPaymentIntent: async (req, res) => {
        try {
            const { event_id, tier_id, seat_number, quantity = 1, customer_name, customer_mobile, customer_email } = req.body;

            if (!event_id) return res.status(400).json({ success: false, message: 'event_id is required' });
            if (!customer_name) return res.status(400).json({ success: false, message: 'customer_name is required' });
            if (!customer_mobile) return res.status(400).json({ success: false, message: 'customer_mobile is required' });

            const event = await FunctionAllot.findByPk(event_id);
            if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

            let amount = 0;
            let tierName = null;

            if (tier_id) {
                // Tiered pricing
                const tier = await TicketTier.findByPk(tier_id);
                if (!tier || tier.function_allot_id != event_id) {
                    return res.status(400).json({ success: false, message: 'Invalid ticket tier' });
                }
                const availableSeats = tier.total_seats - tier.seats_booked;
                if (availableSeats < quantity) {
                    return res.status(400).json({ success: false, message: `Only ${availableSeats} seat(s) available in ${tier.tier_name}` });
                }
                amount = parseFloat(tier.price) * quantity;
                tierName = tier.tier_name;
            } else {
                // Flat pricing — read from FunctionField 'Ticket Amount'
                const amountField = await FunctionField.findOne({
                    where: { function_id: event.function_id, name: 'Ticket Amount' }
                });
                if (!amountField) {
                    return res.status(400).json({ success: false, message: 'This event does not support ticket booking' });
                }
                const valueRecord = await FieldValue.findOne({
                    where: { function_allot_id: event_id, function_field_id: amountField.function_field_id }
                });
                const cleaned = valueRecord ? valueRecord.value.replace(/[^0-9.]/g, '') : '0';
                amount = parseFloat(cleaned) * quantity;
            }

            if (isNaN(amount) || amount <= 0) {
                return res.status(400).json({ success: false, message: 'Invalid ticket amount' });
            }

            // Check if selected seat is already booked
            if (seat_number) {
                const existing = await Booking.findOne({
                    where: { function_allot_id: event_id, seat_number, payment_status: 'paid' }
                });
                if (existing) {
                    return res.status(400).json({ success: false, message: `Seat ${seat_number} is already booked` });
                }
            }

            // Get stripe_account_id from admin settings
            const appAdminUserId = event.user_id;
            const appSettings = await AppSettings.findOne({ where: { user_id: appAdminUserId } });

            // Commission rate
            let commissionRate = 10.00;
            const userRecord = await User.findByPk(appAdminUserId);
            if (userRecord?.commission_rate != null) {
                commissionRate = parseFloat(userRecord.commission_rate);
            }

            const stripeAmount = Math.round(amount * 100);
            const applicationFeeAmount = Math.round(stripeAmount * (commissionRate / 100));

            const paymentParams = {
                amount: stripeAmount,
                currency: 'usd',
                payment_method_types: ['card'],
                metadata: {
                    event_id: String(event_id),
                    tier_id: tier_id ? String(tier_id) : '',
                    seat_number: seat_number || '',
                    customer_name,
                    customer_mobile,
                    quantity: String(quantity)
                }
            };

            if (appSettings?.stripe_account_id) {
                paymentParams.application_fee_amount = applicationFeeAmount;
                paymentParams.transfer_data = { destination: appSettings.stripe_account_id };
            }

            const paymentIntent = await stripe.paymentIntents.create(paymentParams);

            // Save a pending booking record
            const bookingRef = generateBookingRef();
            const booking = await Booking.create({
                function_allot_id: event_id,
                customer_name,
                customer_mobile,
                customer_email: customer_email || null,
                ticket_tier_id: tier_id || null,
                tier_name: tierName,
                seat_number: seat_number || null,
                quantity,
                amount_paid: amount,
                payment_intent_id: paymentIntent.id,
                payment_status: 'pending',
                booking_reference: bookingRef,
                created_at: new Date()
            });

            res.json({
                success: true,
                clientSecret: paymentIntent.client_secret,
                booking_id: booking.booking_id,
                booking_reference: bookingRef,
                amount,
                tier_name: tierName,
                seat_number: seat_number || null
            });

        } catch (error) {
            console.error('CreateBookingPaymentIntent Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ─────────────────────────────────────────────
    // POST /api/booking/confirm
    // Called after Stripe payment succeeds (from mobile client)
    // Body: { booking_id, payment_intent_id }
    // ─────────────────────────────────────────────
    confirmBooking: async (req, res) => {
        try {
            const { booking_id, payment_intent_id } = req.body;

            if (!booking_id || !payment_intent_id) {
                return res.status(400).json({ success: false, message: 'booking_id and payment_intent_id are required' });
            }

            const booking = await Booking.findByPk(booking_id);
            if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

            // Verify with Stripe
            const intent = await stripe.paymentIntents.retrieve(payment_intent_id);
            if (intent.status !== 'succeeded') {
                return res.status(400).json({ success: false, message: 'Payment not yet confirmed by Stripe' });
            }

            // Mark booking as paid
            booking.payment_status = 'paid';
            await booking.save();

            // Increment seats_booked on the tier
            if (booking.ticket_tier_id) {
                const tier = await TicketTier.findByPk(booking.ticket_tier_id);
                if (tier) {
                    tier.seats_booked = tier.seats_booked + booking.quantity;
                    await tier.save();
                }
            }

            // Fetch event title for notifications
            const event = await FunctionAllot.findByPk(booking.function_allot_id);
            const bookingWithTitle = { ...booking.toJSON(), event_title: event?.title || 'Event' };

            // Generate ticket PDF to attach
            let pdfBuffer = null;
            try {
                pdfBuffer = await TicketPDFService.generateTicketPDF(bookingWithTitle, event?.title || 'Event');
            } catch (e) {
                console.error('Could not generate PDF for notification:', e.message);
            }

            // Fire notifications (non-blocking — don't fail the request if notify fails)
            NotificationService.sendBookingConfirmation(
                bookingWithTitle,
                booking.customer_email,    // email: pass customer email here
                booking.customer_mobile,   // SMS to mobile number
                pdfBuffer
            ).catch(err => console.error('Notification error:', err));

            res.json({
                success: true,
                message: 'Booking confirmed!',
                booking_reference: booking.booking_reference,
                booking: bookingWithTitle
            });
        } catch (error) {
            console.error('ConfirmBooking Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ─────────────────────────────────────────────
    // GET /api/booking/list/:event_id  (Admin use)
    // ─────────────────────────────────────────────
    listBookings: async (req, res) => {
        try {
            const { event_id } = req.params;
            const bookings = await Booking.findAll({
                where: { function_allot_id: event_id },
                order: [['created_at', 'DESC']]
            });
            res.json({ success: true, bookings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ─────────────────────────────────────────────
    // POST /api/booking/tiers  (Admin: save tiers for event)
    // Body: { event_id, tiers: [{ tier_name, price, total_seats, color, description }] }
    // ─────────────────────────────────────────────
    saveTiers: async (req, res) => {
        try {
            const { event_id, tiers } = req.body;
            if (!event_id || !Array.isArray(tiers)) {
                return res.status(400).json({ success: false, message: 'event_id and tiers[] are required' });
            }

            // Soft-delete existing active tiers and recreate
            await TicketTier.update({ status: '0' }, { where: { function_allot_id: event_id } });

            const created = [];
            for (const t of tiers) {
                if (!t.tier_name || !t.price) continue;
                const tier = await TicketTier.create({
                    function_allot_id: event_id,
                    tier_name: t.tier_name,
                    price: parseFloat(t.price),
                    total_seats: parseInt(t.total_seats) || 100,
                    seats_booked: 0,
                    color: t.color || null,
                    description: t.description || null,
                    status: '1'
                });
                created.push(tier);
            }

            res.json({ success: true, tiers: created });
        } catch (error) {
            console.error('SaveTiers Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ─────────────────────────────────────────────
    // GET /api/booking/ticket/:booking_id
    // Streams a PDF ticket with QR code
    // ─────────────────────────────────────────────
    downloadTicket: async (req, res) => {
        try {
            const { booking_id } = req.params;
            const booking = await Booking.findByPk(booking_id);
            if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
            if (booking.payment_status !== 'paid') {
                return res.status(400).json({ success: false, message: 'Ticket is only available for paid bookings' });
            }

            const event = await FunctionAllot.findByPk(booking.function_allot_id);
            const bookingData = { ...booking.toJSON(), event_title: event?.title || 'Event' };

            const pdfBuffer = await TicketPDFService.generateTicketPDF(bookingData, event?.title || 'Event');

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="ticket-${booking.booking_reference}.pdf"`,
                'Content-Length': pdfBuffer.length
            });
            res.send(pdfBuffer);
        } catch (error) {
            console.error('DownloadTicket Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ─────────────────────────────────────────────
    // GET /api/booking/my/:mobile
    // Fetch all bookings for a customer by mobile number
    // ─────────────────────────────────────────────
    myBookings: async (req, res) => {
        try {
            const { mobile } = req.params;
            if (!mobile) return res.status(400).json({ success: false, message: 'mobile is required' });

            const bookings = await Booking.findAll({
                where: { customer_mobile: mobile },
                order: [['created_at', 'DESC']]
            });

            // Attach event titles
            const enriched = await Promise.all(bookings.map(async (b) => {
                const event = await FunctionAllot.findByPk(b.function_allot_id, {
                    attributes: ['title', 'image']
                });
                return {
                    ...b.toJSON(),
                    event_title: event?.title || 'Event',
                    event_image: event?.image || null
                };
            }));

            res.json({ success: true, bookings: enriched });
        } catch (error) {
            console.error('MyBookings Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = BookingController;
