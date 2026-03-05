const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PushToken = sequelize.define('PushToken', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    token: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true
    },
    platform: {
        type: DataTypes.ENUM('ios', 'android', 'web'),
        defaultValue: 'ios'
    },
    contact_mobile: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    app_id: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'push_tokens',
    timestamps: false
});

module.exports = PushToken;
