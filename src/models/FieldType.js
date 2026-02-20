const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FieldType = sequelize.define('FieldType', {
    field_type_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    field_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('1', '0'),
        defaultValue: '1'
    }
}, {
    tableName: 'field_types',
    timestamps: false
});

module.exports = FieldType;
