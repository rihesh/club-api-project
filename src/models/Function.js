const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FunctionModel = sequelize.define('Function', {
    function_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    function_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('1', '0'),
        defaultValue: '1'
    },
    category: {
        type: DataTypes.ENUM('0', '1'),
        defaultValue: '0'
    },
    function_org_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    setting: {
        type: DataTypes.ENUM('1', '0', '2', '3', '11'),
        defaultValue: '0',
        comment: '1=>setting,2=>video gallery,3=>image gallery'
    },
    date_filter: {
        type: DataTypes.ENUM('1', '0'),
        defaultValue: '0'
    },
    multiple: {
        type: DataTypes.ENUM('1', '0'),
        defaultValue: '0'
    },
    function_order: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    show_user: {
        type: DataTypes.ENUM('0', '1', '2'),
        defaultValue: '1',
        comment: '0 => show api only 1 => show both user and api 2 => show user only'
    },
    user_type: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    identification: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'functions',
    timestamps: false
});

module.exports = FunctionModel;
