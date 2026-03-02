const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
    booking_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    function_allot_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    customer_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    customer_mobile: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    ticket_tier_id: {
        type: DataTypes.INTEGER,
        allowNull: true  // null = no tier (flat price event)
    },
    tier_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    seat_number: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    amount_paid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    payment_intent_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'cancelled'),
        defaultValue: 'pending'
    },
    booking_reference: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'bookings',
    timestamps: false
});

module.exports = Booking;
