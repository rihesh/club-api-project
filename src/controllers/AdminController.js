const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');

const AdminController = {
    login: async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.json({ success: false, message: 'Username and password required' });
        }

        try {
            // MD5 hash for password (legacy support)
            const md5Password = crypto.createHash('md5').update(password).digest('hex');

            const query = `SELECT * FROM users WHERE user_name = :username AND (password = :password OR password = :md5Password)`;
            const [admin] = await sequelize.query(query, {
                replacements: { username, password, md5Password },
                type: QueryTypes.SELECT
            });

            if (admin) {
                // In a real app, generate JWT here. For now, return success.
                res.json({
                    success: true,
                    admin_id: admin.user_id,
                    username: admin.user_name,
                    app_id: admin.app_id,
                    user_type: admin.user_type
                });
            } else {
                res.json({ success: false, message: 'Invalid credentials' });
            }
        } catch (error) {
            console.error("Admin Login Error:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    getDashboardStats: async (req, res) => {
        // Mock dashboard stats based on data
        try {
            // Simple counts
            const [usersCount] = await sequelize.query("SELECT COUNT(*) as count FROM customers", { type: QueryTypes.SELECT });
            const [functionsCount] = await sequelize.query("SELECT COUNT(*) as count FROM functions WHERE status='1'", { type: QueryTypes.SELECT });

            res.json({
                success: true,
                stats: {
                    total_users: usersCount.count,
                    active_modules: functionsCount.count,
                    total_events: functionsCount.count // Mapping functions to events for now
                }
            });
        } catch (error) {
            console.error("Dashboard Stats Error:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    getModules: async (req, res) => {
        try {
            const { admin_id, is_super } = req.query;

            let query;
            let replacements = {};

            if (is_super === '1') {
                query = `
                    SELECT function_id, function_name, description, status, category, function_org_name 
                    FROM functions 
                    ORDER BY function_order ASC
                `;
            } else {
                // For App Admin, join with functions_user to get allotted modules
                // And use the display name (fu.name) if available, else fallback to function_name
                query = `
                    SELECT 
                        f.function_id, 
                        COALESCE(fu.name, f.function_name) as function_name, 
                        f.description, 
                        fu.status as status, 
                        f.category, 
                        f.function_org_name 
                    FROM functions f
                    JOIN functions_user fu ON f.function_id = fu.function_id
                    WHERE fu.user_id = :admin_id AND f.status = '1'
                    ORDER BY f.function_order ASC
                `;
                replacements = { admin_id };
            }

            const modules = await sequelize.query(query, {
                replacements,
                type: QueryTypes.SELECT
            });

            res.json({
                success: true,
                modules
            });
        } catch (error) {
            console.error("Get Modules Error:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    getUsers: async (req, res) => {
        try {
            const users = await sequelize.query(
                "SELECT user_id, user_name, name, email, commission_rate FROM users WHERE user_type > 1", // Assuming 1=SuperAdmin
                { type: QueryTypes.SELECT }
            );
            res.json({ success: true, users });
        } catch (error) {
            console.error("Get Users Error:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    updateModuleStatus: async (req, res) => {
        try {
            const { admin_id, function_id, status } = req.body;

            // This only supports App Admin toggling their allotted modules for now
            // For Super Admin to toggle global modules, we'd need a separate check or flag

            // Update functions_user status
            await sequelize.query(
                `UPDATE functions_user SET status = :status WHERE user_id = :admin_id AND function_id = :function_id`,
                {
                    replacements: { status, admin_id, function_id },
                    type: QueryTypes.UPDATE
                }
            );

            res.json({ success: true, message: 'Status updated successfully' });
        } catch (error) {
            console.error("Update Module Status Error:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    createUser: async (req, res) => {
        try {
            const { user_name, password, email, name, app_id, user_type } = req.body;

            // Validate inputs?

            const md5Password = crypto.createHash('md5').update(password).digest('hex');

            await sequelize.query(
                `INSERT INTO users (user_name, password, email, name, app_id, user_type, status, created_date) 
                 VALUES (:user_name, :password, :email, :name, :app_id, :user_type, '1', NOW())`,
                {
                    replacements: {
                        user_name,
                        password: md5Password,
                        email: email || '',
                        name: name || '',
                        app_id: app_id || '',
                        user_type: user_type || 2
                    },
                    type: QueryTypes.INSERT
                }
            );

            res.json({ success: true, message: 'User created successfully' });
        } catch (error) {
            console.error("Create User Error:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            // Optionally, prevent deleting the superadmin (user_id = 1)
            if (id === '1') {
                return res.status(403).json({ success: false, message: 'Cannot delete Super Admin' });
            }

            // We do a hard delete for now, or update status to '0'? 
            // Often in this schema, status='0' is soft delete, but we'll run a DELETE matching typical CRUD
            await sequelize.query(
                `DELETE FROM users WHERE user_id = :id AND user_type > 1`,
                {
                    replacements: { id },
                    type: QueryTypes.DELETE
                }
            );

            res.json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            console.error("Delete User Error:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    resetUserPassword: async (req, res) => {
        try {
            const { id } = req.params;
            const { new_password } = req.body;

            if (!new_password) {
                return res.status(400).json({ success: false, message: 'New password is required' });
            }

            const md5Password = crypto.createHash('md5').update(new_password).digest('hex');

            await sequelize.query(
                `UPDATE users SET password = :password WHERE user_id = :id`,
                {
                    replacements: { password: md5Password, id },
                    type: QueryTypes.UPDATE
                }
            );

            res.json({ success: true, message: 'Password reset successfully' });
        } catch (error) {
            console.error("Reset Password Error:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    updateUserCommission: async (req, res) => {
        try {
            const { id } = req.params;
            const { commission_rate } = req.body;

            if (commission_rate === undefined || commission_rate === null) {
                return res.status(400).json({ success: false, message: 'Commission rate is required' });
            }

            const parsedRate = parseFloat(commission_rate);
            if (isNaN(parsedRate) || parsedRate < 0 || parsedRate > 100) {
                return res.status(400).json({ success: false, message: 'Commission rate must be a valid percentage between 0 and 100.' });
            }

            await sequelize.query(
                `UPDATE users SET commission_rate = :commission_rate WHERE user_id = :id AND user_type > 1`,
                {
                    replacements: { commission_rate: parsedRate.toFixed(2), id },
                    type: QueryTypes.UPDATE
                }
            );

            res.json({ success: true, message: 'Commission rate updated successfully' });
        } catch (error) {
            console.error("Update Commission Error:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
};

module.exports = AdminController;
