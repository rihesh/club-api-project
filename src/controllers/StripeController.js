const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const { AppSettings, FunctionAllot, FieldValue, FunctionField } = require('../models');

class StripeController {

    // 1. Onboarding API for App Admin
    static async createAccountLink(req, res) {
        try {
            const userId = req.user?.id || req.body.user_id; // Assume passed or from token

            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            let appSettings = await AppSettings.findOne({ where: { user_id: userId } });

            if (!appSettings) {
                appSettings = await AppSettings.create({ user_id: userId });
            }

            let accountId = appSettings.stripe_account_id;

            // For accounts based in India (and many international platforms), 
            // the platform must use Standard Connect where the connected account assumes liability.
            if (!accountId) {
                const account = await stripe.accounts.create({
                    type: 'standard',
                });
                accountId = account.id;
                await appSettings.update({ stripe_account_id: accountId });
            }

            // Create an onboarding link
            const accountLink = await stripe.accountLinks.create({
                account: accountId,
                refresh_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/settings?stripe_status=refresh`,
                return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/settings?stripe_status=success`,
                type: 'account_onboarding',
            });

            res.json({ url: accountLink.url, accountId });

        } catch (error) {
            console.error('Stripe Onboarding Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // 2. Fetch connection status
    static async getAccountStatus(req, res) {
        try {
            const userId = req.user?.id || req.params.userId || req.query.user_id;

            const appSettings = await AppSettings.findOne({ where: { user_id: userId } });
            if (!appSettings || !appSettings.stripe_account_id) {
                return res.json({ connected: false, message: 'No Stripe account exists.' });
            }

            const account = await stripe.accounts.retrieve(appSettings.stripe_account_id);
            res.json({
                connected: account.details_submitted,
                accountId: account.id,
                charges_enabled: account.charges_enabled
            });

        } catch (error) {
            console.error('Stripe Status Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // 3. Create Payment Intent for purchasing an event ticket
    static async createPaymentIntent(req, res) {
        try {
            const { event_id } = req.body;

            if (!event_id) {
                return res.status(400).json({ error: 'Event ID (function_allot_id) is required' });
            }

            // Fetch the event
            const event = await FunctionAllot.findByPk(event_id);
            if (!event) {
                return res.status(404).json({ error: 'Event not found' });
            }

            // Get the App Admin who owns this event
            const appAdminUserId = event.user_id;

            // Get App Admin's stripe_account_id
            const appSettings = await AppSettings.findOne({ where: { user_id: appAdminUserId } });

            if (!appSettings || !appSettings.stripe_account_id) {
                console.warn('Event creator has not connected a Stripe account yet. Processing as a direct platform charge for demo purposes.');
            }

            // Get the Ticket Amount from dynamic fields
            const amountField = await FunctionField.findOne({
                where: { function_id: event.function_id, name: 'Ticket Amount' }
            });

            if (!amountField) {
                return res.status(400).json({ error: 'This module does not support ticket purchasing.' });
            }

            const valueRecord = await FieldValue.findOne({
                where: { function_allot_id: event_id, function_field_id: amountField.function_field_id }
            });

            let amountStr = valueRecord ? valueRecord.value : "0";
            let amount = parseFloat(amountStr);

            if (isNaN(amount) || amount <= 0) {
                return res.status(400).json({ error: 'Invalid ticket amount for this event.' });
            }

            // Stripe expects amount in cents or minimum units
            const stripeAmount = Math.round(amount * 100);

            // 10% commission for the Super Admin
            const applicationFeeAmount = Math.round(stripeAmount * 0.10);

            // Default Payment Params for Direct Charge (if app admin not onboarded)
            const paymentParams = {
                amount: stripeAmount,
                currency: 'usd',
                payment_method_types: ['card'],
            };

            // If App Admin is fully onboarded, split the commission securely via Stripe Connect logic
            if (appSettings && appSettings.stripe_account_id) {
                paymentParams.application_fee_amount = applicationFeeAmount;
                paymentParams.transfer_data = {
                    destination: appSettings.stripe_account_id,
                };
            }

            // Create a PaymentIntent
            const paymentIntent = await stripe.paymentIntents.create(paymentParams);

            res.json({
                clientSecret: paymentIntent.client_secret,
                amount: amount,
                fee: applicationFeeAmount / 100
            });

        } catch (error) {
            console.error('Create Payment Intent Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = StripeController;
