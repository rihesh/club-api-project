const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FieldValue = sequelize.define('FieldValue', {
    field_value_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    function_allot_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    function_field_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'field_values',
    timestamps: false
});

module.exports = FieldValue;
