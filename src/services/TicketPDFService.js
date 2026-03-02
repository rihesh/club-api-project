/**
 * TicketPDFService
 * Generates a PDF ticket with QR code for a confirmed booking.
 * Uses: pdfkit + qrcode
 */

const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const TicketPDFService = {

    /**
     * Generate PDF ticket and pipe it to a response stream (or buffer).
     * @param {Object} booking  — full booking record
     * @param {string} eventTitle
     * @param {Object} res      — Express response object (if streaming directly)
     * @returns {Buffer}        — if res not provided, returns buffer
     */
    async generateTicketPDF(booking, eventTitle, res = null) {
        const {
            booking_reference, customer_name, customer_mobile,
            tier_name, seat_number, quantity, amount_paid, created_at
        } = booking;

        // Generate QR code as PNG data URL (encodes the booking ref)
        const qrDataURL = await QRCode.toDataURL(booking_reference, {
            errorCorrectionLevel: 'H',
            margin: 1,
            color: { dark: '#1a1a2e', light: '#ffffff' }
        });

        // Strip data URL prefix to get raw base64
        const qrBase64 = qrDataURL.replace(/^data:image\/png;base64,/, '');
        const qrBuffer = Buffer.from(qrBase64, 'base64');

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: [400, 620],
                margin: 0,
                compress: true
            });

            const buffers = [];
            doc.on('data', chunk => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            if (res) {
                doc.pipe(res);
            }

            // ── Background ──────────────────────────────────────
            doc.rect(0, 0, 400, 620).fill('#1a1a2e');

            // ── Top gradient strip ───────────────────────────────
            const grad = doc.linearGradient(0, 0, 400, 0);
            grad.stop(0, '#6C63FF').stop(1, '#4B44CC');
            doc.rect(0, 0, 400, 120).fill(grad);

            // ── Event title ──────────────────────────────────────
            doc.font('Helvetica-Bold')
                .fontSize(22)
                .fillColor('#ffffff')
                .text('🎟  TICKET', 30, 28, { align: 'left' });

            doc.fontSize(13)
                .fillColor('rgba(255,255,255,0.8)')
                .text(eventTitle || 'Event Ticket', 30, 58, { width: 340, align: 'left' });

            doc.fontSize(11)
                .fillColor('rgba(255,255,255,0.6)')
                .text(new Date(created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 30, 82, { width: 340 });

            // ── Dashed separator ────────────────────────────────
            doc.moveTo(30, 135).lineTo(370, 135)
                .dash(4, { space: 4 })
                .stroke('#ffffff22');

            // ── Info rows helper ────────────────────────────────
            const row = (label, value, y) => {
                doc.font('Helvetica')
                    .fontSize(10)
                    .fillColor('#888888')
                    .text(label.toUpperCase(), 30, y);
                doc.font('Helvetica-Bold')
                    .fontSize(14)
                    .fillColor('#ffffff')
                    .text(value || '—', 30, y + 14, { width: 200 });
            };

            row('Ticket Holder', customer_name, 148);
            row('Mobile', customer_mobile, 198);
            row('Tier', tier_name || 'Standard', 248);
            row('Seat', seat_number || 'Open Seating', 298);
            row('Quantity', String(quantity), 348);
            row('Amount Paid', `$${parseFloat(amount_paid).toFixed(2)}`, 398);

            // ── Booking Reference ────────────────────────────────
            doc.rect(26, 447, 348, 48)
                .lineWidth(1.5)
                .dash(6, { space: 4 })
                .stroke('#6C63FF');

            doc.font('Helvetica-Bold')
                .fontSize(11)
                .fillColor('#888')
                .text('BOOKING REFERENCE', 0, 455, { align: 'center', width: 400 });

            doc.fontSize(20)
                .fillColor('#6C63FF')
                .text(booking_reference, 0, 470, { align: 'center', width: 400, characterSpacing: 3 });

            // ── QR Code ──────────────────────────────────────────
            doc.image(qrBuffer, 150, 510, { width: 100, height: 100 });

            doc.font('Helvetica')
                .fontSize(9)
                .fillColor('#555555')
                .text('Scan QR at the venue', 0, 614, { align: 'center', width: 400 });

            // ── Footer note ─────────────────────────────────────
            doc.rect(0, 590, 400, 30).fill('#111122');
            doc.font('Helvetica')
                .fontSize(9)
                .fillColor('#666666')
                .text('This ticket is non-transferable. Present at entry.', 0, 598, { align: 'center', width: 400 });

            doc.end();
        });
    }
};

module.exports = TicketPDFService;
