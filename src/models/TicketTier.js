const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * TicketTier: represents Silver / Gold / Premium tiers for an event.
 * Each event (function_allot_id) can have multiple tiers.
 * Each tier defines: name, price, total seats, seats remaining.
 */
const TicketTier = sequelize.define('TicketTier', {
    tier_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    function_allot_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tier_name: {
        type: DataTypes.STRING(100),
        allowNull: false   // e.g. 'Silver', 'Gold', 'Premium'
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    total_seats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100
    },
    seats_booked: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    color: {
        type: DataTypes.STRING(20),
        allowNull: true    // Hex color for the tier badge, e.g. '#C0C0C0'
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('1', '0'),
        defaultValue: '1'
    }
}, {
    tableName: 'ticket_tiers',
    timestamps: false
});

module.exports = TicketTier;
