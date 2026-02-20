const { FunctionUser, Function: FunctionModel, User, sequelize } = require('../models');

const AllotmentController = {
    // 1. Get Allotted Modules (optionally filtered by user_id)
    getAllotments: async (req, res) => {
        try {
            const { user_id } = req.query;
            const whereClause = user_id ? { user_id } : {};

            const allotments = await FunctionUser.findAll({
                where: whereClause,
                include: [
                    { model: FunctionModel, attributes: ['function_name', 'function_id'] },
                    { model: User, attributes: ['name', 'user_id', 'email'] }
                ]
            });

            res.json({ success: true, allotments });
        } catch (error) {
            console.error('Get Allotments Error:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // 2. Allot Module to User
    createAllotment: async (req, res) => {
        try {
            const { user_id, function_id, name, status } = req.body;

            // Check if already exists
            const existing = await FunctionUser.findOne({
                where: { user_id, function_id }
            });

            if (existing) {
                return res.status(400).json({ success: false, message: 'Module already allotted to this user' });
            }

            // Get standard function name if not provided
            let allottedName = name;
            if (!allottedName) {
                const func = await FunctionModel.findByPk(function_id);
                if (func) allottedName = func.function_name;
            }

            const newAllotment = await FunctionUser.create({
                user_id,
                function_id,
                name: allottedName,
                status: status || '1',
                image: '', // Default empty
                user_types: '' // Default empty
            });

            res.json({ success: true, message: 'Module allotted successfully', id: newAllotment.functions_user_id });

        } catch (error) {
            console.error('Create Allotment Error:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // 3. Delete Allotment
    deleteAllotment: async (req, res) => {
        try {
            const { id } = req.params;
            await FunctionUser.destroy({ where: { functions_user_id: id } });
            res.json({ success: true, message: 'Allotment removed successfully' });
        } catch (error) {
            console.error('Delete Allotment Error:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
};

module.exports = AllotmentController;
