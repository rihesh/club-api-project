const { Function: FunctionModel, FunctionField, FieldType, sequelize } = require('../models');

const SuperAdminController = {
    // 1. Create a New Module (Function)
    createModule: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const {
                function_name,
                description,
                status,
                category,
                date_filter,
                visible_to, // Expecting '0', '1', or '2'
                multiple,
                user_type, // "User Type needed" -> boolean toggle 0/1
            } = req.body;

            // Determine 'show_user' based on visible_to input if needed
            // Assuming frontend sends correct enum value '0', '1', '2'
            // 0 => api, 1 => both, 2 => user

            const newFunction = await FunctionModel.create({
                function_name: function_name,
                function_org_name: function_name, // Using same name for org_name
                description: description || '',
                status: status || '1',
                category: category || '0',
                date_filter: date_filter || '0',
                multiple: multiple || '0',
                show_user: visible_to || '1',
                user_type: user_type || 0,
                // Defaults
                setting: '0',
                function_order: 0,
                identification: 0
            }, { transaction: t });

            await t.commit();
            res.json({ success: true, message: 'Module created successfully', id: newFunction.function_id });

        } catch (error) {
            await t.rollback();
            console.error("Create Module Error:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // 2. Get Field Types (for dropdown)
    getFieldTypes: async (req, res) => {
        try {
            const types = await FieldType.findAll({
                where: { status: '1' }
            });
            res.json({ success: true, types });
        } catch (error) {
            console.error("Get Field Types Error:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // 3. Add Field to Module
    addField: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { function_id } = req.params;
            const {
                name,
                field_type_id,
                instructions,
                required, // '1' or '0'
                module_values, // '1' or '0'
                options // for select/radio
            } = req.body;

            await FunctionField.create({
                function_id,
                name,
                field_type_id,
                instructions,
                required: required || '0',
                module_values: module_values || '0',
                options: options || '',
                status: '1',
                field_order: 0 // Logic to append at end could be added
            }, { transaction: t });

            await t.commit();
            res.json({ success: true, message: 'Field added successfully' });

        } catch (error) {
            await t.rollback();
            console.error("Add Field Error:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // 4. Delete Field
    deleteField: async (req, res) => {
        try {
            const { field_id } = req.params;
            await FunctionField.destroy({ where: { function_field_id: field_id } });
            res.json({ success: true, message: 'Field deleted successfully' });
        } catch (error) {
            console.error("Delete Field Error:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
};

module.exports = SuperAdminController;
