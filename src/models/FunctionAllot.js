const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FunctionAllot = sequelize.define('FunctionAllot', {
    function_allot_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    function_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // Usually distinct user, but 0 for general content
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    image: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('1', '0'),
        defaultValue: '1'
    },
    event_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    time_from: {
        type: DataTypes.TIME,
        allowNull: true
    },
    sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'functions_allot',
    timestamps: false
});

module.exports = FunctionAllot;
