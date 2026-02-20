const { Function: FunctionModel, FunctionField, FieldType, FunctionAllot, FieldValue, User, FunctionUser, sequelize } = require('../models');

const CMSController = {
    // 1. Get Form Structure (Fields)
    getStructure: async (req, res) => {
        try {
            const { function_id } = req.params;
            const fields = await FunctionField.findAll({
                where: { function_id, status: '1' },
                include: [{ model: FieldType }],
                order: [['field_order', 'ASC']]
            });
            res.json({ success: true, fields });
        } catch (error) {
            console.error('Error fetching CMS structure:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    // 2. Get Content List
    getContent: async (req, res) => {
        try {
            const { function_id } = req.params;
            const { user_id } = req.query;

            let whereClause = { function_id, status: '1' };

            // If user_id is provided and user is not Super Admin (logic handled by caller or implicit?)
            // We should trust the user_id passed from frontend IF we trust the auth token.
            // Ideally we get user_id from Token. But here we rely on frontend sending it.
            // If user_id is '0' or undefined, maybe it's Super Admin viewing global?
            // Safer: If user_id provided, filter by it.
            if (user_id) {
                // Check if Super Admin?
                // For now, let's assume if user_id is passed, we filter by it.
                // Except if Super Admin wants to see ALL? 
                // Front end sends admin_id. 
                // Let's check User table to see if it's Super Admin.
                const user = await User.findByPk(user_id);
                // If App Admin (user_type != 1), STRICTLY filter by user_id
                if (user && user.user_type !== 1 && user.user_type !== '1') {
                    whereClause.user_id = user_id;
                }
            }

            const content = await FunctionAllot.findAll({
                where: whereClause,
                order: [['sort_order', 'ASC'], ['function_allot_id', 'DESC']]
            });
            res.json({ success: true, content });
        } catch (error) {
            console.error('Error fetching CMS content:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    // 3. Get Single Item (Structure + Values)
    getContentItem: async (req, res) => {
        try {
            const { function_id, id } = req.params;
            const { user_id } = req.query;

            let item = null;
            let valuesMap = {};

            if (id && id !== 'new') {
                item = await FunctionAllot.findByPk(id);
                if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

                // Ownership Check
                if (user_id) {
                    const user = await User.findByPk(user_id);
                    if (user && user.user_type !== 1 && user.user_type !== '1') {
                        if (String(item.user_id) !== String(user_id)) {
                            return res.status(403).json({ success: false, message: "Unauthorized" });
                        }
                    }
                }

                const values = await FieldValue.findAll({ where: { function_allot_id: id } });
                values.forEach(v => { valuesMap[v.function_field_id] = v.value; });
            }

            // Fetch Fields Structure
            const fields = await FunctionField.findAll({
                where: { function_id, status: '1' },
                include: [{ model: FieldType }],
                order: [['field_order', 'ASC']]
            });

            res.json({ success: true, item, fields, values: valuesMap });
        } catch (error) {
            console.error('Error fetching CMS item:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    // 4. Save Content (Create or Update)
    saveContent: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { function_id } = req.params;
            const { id, title, image, sort_order, event_date, time_from, user_id, ...dynamicFields } = req.body;

            // Security Check: Verify if user has permission for this function
            if (user_id) {
                const user = await User.findByPk(user_id);
                if (user) {
                    // If not Super Admin (User Type 1 or App ID 1)
                    if (user.user_type !== 1 && user.user_type !== '1' && user.app_id !== '1') {
                        const allotment = await FunctionUser.findOne({
                            where: { user_id, function_id, status: '1' }
                        });
                        if (!allotment) {
                            await t.rollback();
                            return res.status(403).json({ success: false, message: 'Unauthorized: You do not have permission for this module.' });
                        }
                    }
                }
            }

            // Basic Data for functions_allot
            const allotData = {
                function_id,
                title: title || 'Untitled',
                image: image || '',
                sort_order: sort_order || 0,
                event_date: event_date || null,
                time_from: time_from || null,
                user_id: user_id || 0
            };

            let allotId = id;

            if (id && id !== 'new') {
                // Update Existing
                // Ownership Check for Update
                if (user_id) {
                    const existingItem = await FunctionAllot.findByPk(id);
                    if (existingItem) {
                        const user = await User.findByPk(user_id);
                        if (user && user.user_type !== 1 && user.user_type !== '1') {
                            if (String(existingItem.user_id) !== String(user_id)) {
                                await t.rollback();
                                return res.status(403).json({ success: false, message: "Unauthorized: You can only edit your own content." });
                            }
                        }
                    }
                }

                await FunctionAllot.update(allotData, { where: { function_allot_id: id }, transaction: t });
            } else {
                // Create New
                const newItem = await FunctionAllot.create(allotData, { transaction: t });
                allotId = newItem.function_allot_id;
            }

            // Save Dynamic Fields
            // dynamicFields keys should be "field_123" where 123 is function_field_id
            for (const [key, value] of Object.entries(dynamicFields)) {
                if (key.startsWith('field_')) {
                    const fieldId = key.replace('field_', '');

                    // Check if value already exists
                    const existingValue = await FieldValue.findOne({
                        where: {
                            function_allot_id: allotId,
                            function_field_id: fieldId
                        },
                        transaction: t
                    });

                    if (existingValue) {
                        await existingValue.update({ value: String(value) }, { transaction: t });
                    } else {
                        await FieldValue.create({
                            function_allot_id: allotId,
                            function_field_id: fieldId,
                            value: String(value)
                        }, { transaction: t });
                    }
                }
            }

            await t.commit();
            res.json({ success: true, message: 'Saved successfully', id: allotId });

        } catch (error) {
            await t.rollback();
            console.error('Error saving CMS content:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    // 5. Delete Content
    deleteContent: async (req, res) => {
        try {
            const { function_id, id } = req.params;
            const { user_id } = req.query; // Expect user_id in query

            // We use soft delete by setting status to '0'
            const item = await FunctionAllot.findByPk(id);
            if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

            // Permission Check
            if (user_id) {
                const user = await User.findByPk(user_id);
                if (user && user.user_type !== 1 && user.user_type !== '1') {
                    // Start of ownership check
                    if (String(item.user_id) !== String(user_id)) {
                        return res.status(403).json({ success: false, message: "Unauthorized: You can only delete your own content." });
                    }
                }
            }

            await item.update({ status: '0' });

            res.json({ success: true, message: 'Deleted successfully' });
        } catch (error) {
            console.error('Error deleting CMS content:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    }
};

module.exports = CMSController;
