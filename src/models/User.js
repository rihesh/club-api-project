const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_name: {
        type: DataTypes.STRING(25),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(25),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    address: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    approve: {
        type: DataTypes.ENUM('0', '1'),
        defaultValue: '0'
    },
    user_type: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    hospital_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    app_id: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    forgot_token: {
        type: DataTypes.STRING(400),
        allowNull: false
    },
    profile_image: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    auth_token: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    device_token: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    device_type: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    image_default_approve: {
        type: DataTypes.ENUM('1', '0'),
        defaultValue: '0'
    }
}, {
    tableName: 'users',
    timestamps: false
});

module.exports = User;
