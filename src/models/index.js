const sequelize = require('../config/database');
const User = require('./User');
const FunctionModel = require('./Function');
const FunctionField = require('./FunctionField');
const FieldType = require('./FieldType');
const FunctionAllot = require('./FunctionAllot');
const FieldValue = require('./FieldValue');
const FunctionUser = require('./FunctionUser');
const AppSettings = require('./AppSettings');

// Define Relationships

// User -> AppSettings
User.hasOne(AppSettings, { foreignKey: 'user_id' });
AppSettings.belongsTo(User, { foreignKey: 'user_id' });

// Function -> Fields
FunctionModel.hasMany(FunctionField, { foreignKey: 'function_id' });
FunctionField.belongsTo(FunctionModel, { foreignKey: 'function_id' });

// Field -> Type
FunctionField.belongsTo(FieldType, { foreignKey: 'field_type_id' });

// Function -> Content (Allot)
FunctionModel.hasMany(FunctionAllot, { foreignKey: 'function_id' });
FunctionAllot.belongsTo(FunctionModel, { foreignKey: 'function_id' });

// Content -> Values
FunctionAllot.hasMany(FieldValue, { foreignKey: 'function_allot_id' });
FieldValue.belongsTo(FunctionAllot, { foreignKey: 'function_allot_id' });

// Value -> Field Definition
FieldValue.belongsTo(FunctionField, { foreignKey: 'function_field_id' });

// User -> Functions (Allotment)
User.hasMany(FunctionUser, { foreignKey: 'user_id' });
FunctionUser.belongsTo(User, { foreignKey: 'user_id' });

FunctionModel.hasMany(FunctionUser, { foreignKey: 'function_id' });
FunctionUser.belongsTo(FunctionModel, { foreignKey: 'function_id' });

module.exports = {
    sequelize,
    User,
    Function: FunctionModel,
    FunctionField,
    FieldType,
    FunctionAllot,
    FieldValue,
    FieldValue,
    FunctionUser,
    AppSettings
};
