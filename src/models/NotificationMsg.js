const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificationMsg = sequelize.define('NotificationMsg', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    app_id: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    data: {
        type: DataTypes.JSON,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'notification_messages',
    timestamps: false
});

module.exports = NotificationMsg;
