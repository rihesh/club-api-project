const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppSettings = sequelize.define('AppSettings', {
    setting_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    app_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    primary_color: {
        type: DataTypes.STRING(20),
        defaultValue: '#000000'
    },
    secondary_color: {
        type: DataTypes.STRING(20),
        defaultValue: '#ffffff'
    },
    background_color: {
        type: DataTypes.STRING(20),
        defaultValue: '#f5f5f5'
    },
    text_color: {
        type: DataTypes.STRING(20),
        defaultValue: '#000000'
    },
    logo_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    // Legacy / Enhanced Fields
    event_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    subtitle: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    statusbar_color: {
        type: DataTypes.STRING(20),
        defaultValue: '#000000'
    },
    home_layout: {
        type: DataTypes.STRING(50),
        defaultValue: 'classic'
    },
    slider_images: {
        type: DataTypes.JSON, // Stores array of URLs
        allowNull: true
    },
    social_links: {
        type: DataTypes.JSON, // Stores { facebook: url, twitter: url }
        allowNull: true
    },
    stripe_account_id: {
        type: DataTypes.STRING(150),
        allowNull: true
    }
}, {
    tableName: 'app_settings',
    timestamps: false
});

module.exports = AppSettings;
