/**
 * NotificationService
 * Handles booking confirmation via Email (Nodemailer) and SMS (Twilio).
 * Both are OPTIONAL — they only fire if the env vars are configured.
 *
 * Required env vars:
 *   Email: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *   SMS:   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
 */

const nodemailer = require('nodemailer');

// ── Email transporter (lazy init) ──────────────────────────────────────────
let emailTransporter = null;

function getEmailTransporter() {
    if (emailTransporter) return emailTransporter;
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;

    emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false }
    });
    return emailTransporter;
}

// ── Twilio SMS (lazy init) ─────────────────────────────────────────────────
function getTwilioClient() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return null;
    const twilio = require('twilio');
    return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// ── Build confirmation HTML email ──────────────────────────────────────────
function buildEmailHTML(booking) {
    const {
        booking_reference, customer_name, event_title,
        tier_name, seat_number, quantity, amount_paid, created_at
    } = booking;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .card { background: #fff; border-radius: 16px; max-width: 520px; margin: auto; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { text-align: center; background: linear-gradient(135deg,#6C63FF,#4B44CC); border-radius: 12px; padding: 24px; color: #fff; margin-bottom: 24px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 4px 0 0; opacity: 0.85; }
    .ref { text-align: center; background: #f0eeff; border-radius: 8px; padding: 12px; font-size: 22px; font-weight: bold; color: #6C63FF; letter-spacing: 2px; margin-bottom: 24px; border: 2px dashed #6C63FF; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .row label { color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .row span { font-weight: 600; color: #222; }
    .footer { text-align: center; margin-top: 24px; color: #aaa; font-size: 12px; }
    .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; border-radius: 20px; padding: 4px 14px; font-size: 13px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🎟️ Booking Confirmed!</h1>
      <p>${event_title || 'Your Event'}</p>
    </div>
    <p>Hi <strong>${customer_name}</strong>, your ticket has been booked successfully!</p>
    <div class="ref">${booking_reference}</div>
    <div class="row"><label>Event</label><span>${event_title || '—'}</span></div>
    <div class="row"><label>Tier</label><span>${tier_name || 'Standard'}</span></div>
    <div class="row"><label>Seat</label><span>${seat_number || 'Open Seating'}</span></div>
    <div class="row"><label>Quantity</label><span>${quantity}</span></div>
    <div class="row"><label>Amount Paid</label><span>$${parseFloat(amount_paid).toFixed(2)}</span></div>
    <div class="row"><label>Status</label><span><span class="badge">✅ Confirmed</span></span></div>
    <div class="footer">Please show this email or your reference code at the venue.<br>Thank you for booking with us!</div>
  </div>
</body>
</html>`;
}

// ── Build SMS text ─────────────────────────────────────────────────────────
function buildSMSText(booking) {
    const { booking_reference, event_title, tier_name, seat_number, amount_paid } = booking;
    return `🎟 Booking Confirmed!\nRef: ${booking_reference}\nEvent: ${event_title || 'Event'}\nTier: ${tier_name || 'Standard'}\nSeat: ${seat_number || 'Open'}\nAmt: $${parseFloat(amount_paid).toFixed(2)}\nShow this at the venue.`;
}

// ── Main send function ─────────────────────────────────────────────────────
const NotificationService = {

    /**
     * Send booking confirmation via email and/or SMS.
     * @param {Object} booking  — booking record with customer info
     * @param {string} email    — optional customer email
     * @param {string} mobile   — customer mobile (digits only, with country code)
     */
    async sendBookingConfirmation(booking, email, mobile) {
        const results = [];

        // ── EMAIL ──
        const transporter = getEmailTransporter();
        if (transporter && email) {
            try {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || `"EventApp" <${process.env.SMTP_USER}>`,
                    to: email,
                    subject: `🎟 Booking Confirmed — Ref: ${booking.booking_reference}`,
                    html: buildEmailHTML(booking),
                });
                results.push({ channel: 'email', status: 'sent', to: email });
                console.log(`✅ Confirmation email sent to ${email}`);
            } catch (err) {
                results.push({ channel: 'email', status: 'failed', error: err.message });
                console.error('❌ Email send failed:', err.message);
            }
        } else if (!transporter) {
            results.push({ channel: 'email', status: 'skipped', reason: 'SMTP not configured' });
        }

        // ── SMS ──
        const twilioClient = getTwilioClient();
        if (twilioClient && mobile && process.env.TWILIO_FROM_NUMBER) {
            // Normalise mobile number
            const normalised = mobile.startsWith('+') ? mobile : `+${mobile.replace(/\D/g, '')}`;
            try {
                await twilioClient.messages.create({
                    from: process.env.TWILIO_FROM_NUMBER,
                    to: normalised,
                    body: buildSMSText(booking)
                });
                results.push({ channel: 'sms', status: 'sent', to: normalised });
                console.log(`✅ Confirmation SMS sent to ${normalised}`);
            } catch (err) {
                results.push({ channel: 'sms', status: 'failed', error: err.message });
                console.error('❌ SMS send failed:', err.message);
            }
        } else if (!twilioClient) {
            results.push({ channel: 'sms', status: 'skipped', reason: 'Twilio not configured' });
        }

        return results;
    }
};

module.exports = NotificationService;
