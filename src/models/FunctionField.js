const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FunctionField = sequelize.define('FunctionField', {
    function_field_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    field_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    field_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    required: {
        type: DataTypes.ENUM('1', '0'),
        defaultValue: '0'
    },
    function_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('1', '0'),
        defaultValue: '1'
    },
    options: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    module_values: {
        type: DataTypes.ENUM('1', '0'),
        defaultValue: '0'
    }
}, {
    tableName: 'function_fields',
    timestamps: false
});

module.exports = FunctionField;
