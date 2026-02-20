const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FunctionUser = sequelize.define('FunctionUser', {
    functions_user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    function_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('1', '0'),
        defaultValue: '1'
    },
    user_types: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'functions_user',
    timestamps: false
});

module.exports = FunctionUser;
