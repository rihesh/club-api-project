const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');
const { User, FunctionAllot, FieldValue, FunctionField, FieldType, AppSettings } = require('../models');

const ApiController = {
    // Helper: Fetch Data (replicating Api.php fetch_data)
    fetch_data: async (allot_id, user_id) => {
        try {
            // 1. Get Function Details
            const functionDetailsQuery = `
        SELECT f.function_org_name, f.multiple, f.setting, f.category, f.function_id, fa.status, fa.title, fa.count, fa.event_date
        FROM functions_allot fa 
        LEFT JOIN functions f ON (fa.function_id = f.function_id) 
        WHERE fa.function_allot_id = :allot_id AND fa.status = '1'
      `;
            const [functionDetails] = await sequelize.query(functionDetailsQuery, {
                replacements: { allot_id },
                type: QueryTypes.SELECT
            });

            if (!functionDetails) return {};

            // 2. Get Fields
            const fieldsQuery = `
        SELECT * FROM function_fields 
        WHERE function_id = :function_id AND status = '1' 
        ORDER BY field_order ASC
      `;
            const fields = await sequelize.query(fieldsQuery, {
                replacements: { function_id: functionDetails.function_id },
                type: QueryTypes.SELECT
            });

            // 3. Construct JSON
            let json = {};

            // Add date if present (from PHP logic)
            if (functionDetails.event_date && functionDetails.event_date !== '0000-00-00') {
                json['date'] = functionDetails.event_date;
            }

            const multiple = functionDetails.multiple;
            // Simplified loop logic for now - primarily for Settings (key-value pairs)
            // The PHP loop is complex (do-while), we'll start with basic field fetching

            if (multiple === '0') {
                // Single Value (Key-Value)
                for (const field of fields) {
                    const valueQuery = `SELECT value FROM field_values WHERE function_allot_id = :allot_id AND function_field_id = :field_id`;
                    const [valueResult] = await sequelize.query(valueQuery, {
                        replacements: { allot_id, field_id: field.function_field_id },
                        type: QueryTypes.SELECT
                    });

                    const val = valueResult ? valueResult.value : '';
                    // Apply logic for different field types (simplified)
                    // For now, raw value
                    json[field.name] = val;
                }
            }

            return json;

        } catch (error) {
            console.error("Error in fetch_data:", error);
            return {};
        }
    },

    list_modules: async (req, res) => {
        const { key, appid } = req.params;

        try {
            if (key !== 'api_key') {
                return res.json({ success: false, message: 'Invalid secret key' });
            }

            if (!appid) {
                return res.json({ success: false, message: 'App id cannot be blank' });
            }

            const user = await User.findOne({ where: { app_id: appid } });
            if (!user) {
                return res.json({ success: false, message: 'User not Exists' });
            }

            const userId = user.user_id;
            let responseJson = {};

            const settingsIdQuery = `
        SELECT fa.function_allot_id 
        FROM functions f 
        LEFT JOIN functions_allot fa ON (f.function_id = fa.function_id) 
        WHERE f.setting = '1' AND fa.user_id = :user_id
        LIMIT 1
      `;
            const [settingsResult] = await sequelize.query(settingsIdQuery, {
                replacements: { user_id: userId },
                type: QueryTypes.SELECT
            });

            if (settingsResult) {
                responseJson = await ApiController.fetch_data(settingsResult.function_allot_id, userId);
            } else {
                responseJson['settings'] = 'No Settings';
            }

            /* 
             * REFACTORED: Use functions_user table directly instead of legacy alloted_functions.
             * The Admin Panel writes to functions_user (FunctionUser model).
             */

            // Fetch all allotted functions for this user
            const detailsQuery = `
                SELECT f.function_id, f.category, f.show_user, f.setting, f.status as f_status, 
                       fu.name, fu.image, fu.status as fu_status
                FROM functions f 
                JOIN functions_user fu ON (f.function_id = fu.function_id) 
                WHERE fu.user_id = :user_id 
                AND fu.status = '1' 
                AND f.status = '1'
                AND f.setting IN ('0', '2', '3')
            `;

            const functions = await sequelize.query(detailsQuery, {
                replacements: { user_id: userId },
                type: QueryTypes.SELECT
            });

            responseJson['functions'] = [];

            for (const details of functions) {
                if (details && (details.show_user === '1' || details.show_user === '0' || details.show_user === '2')) {
                    let categoryId = '';
                    // Original logic: if category is 0, find related functions_allot?
                    // Leaving this logic intact if it serves a purpose for frontend grouping
                    if (details.category == '0') {
                        const catQuery = `SELECT function_allot_id FROM functions_allot WHERE user_id = :user_id AND function_id = :fn_id`;
                        const [catResult] = await sequelize.query(catQuery, {
                            replacements: { user_id: userId, fn_id: details.function_id },
                            type: QueryTypes.SELECT
                        });
                        if (catResult) categoryId = catResult.function_allot_id;
                    }

                    responseJson['functions'].push({
                        function_id: details.function_id,
                        name: details.name, // Use name from allotment (custom name support)
                        category: details.category,
                        image: details.image ? `http://localhost:3000/uploads/${details.image}` : '',
                        category_id: categoryId
                    });
                }
            }

            responseJson['app_status'] = user.approve === 1;
            responseJson['success'] = true;

            res.json(responseJson);

        } catch (error) {
            console.error("List Modules Error:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    login: async (req, res) => {
        // Replica of customer_login in Api.php (Phone based auth)
        const { phone, name, email } = req.body;

        if (!phone) {
            return res.json({ success: false, message: 'Phone number required' });
        }

        try {
            // Check if customer exists
            const query = `SELECT * FROM customers WHERE phone = :phone`;
            const [user] = await sequelize.query(query, {
                replacements: { phone },
                type: QueryTypes.SELECT
            });

            if (user) {
                // Login successful
                res.json({
                    success: true,
                    user_id: user.customer_id,
                    user_details: user,
                    // Token logic usually involves generating a new token and updating DB
                    // For now returning existing user details
                });
            } else {
                // Register new user (Simplified)
                const insertQuery = `
                    INSERT INTO customers (name, email, phone, date_added, status, type, user_id, updated_from, country_code, token, device_token, device_type, profile_image, address)
                    VALUES (:name, :email, :phone, NOW(), 1, 2, 0, 1, '', '', '', '', '', '')
                `;
                // Note: user_id=0 is placeholder. logic for user_id assignment?
                // Api.php uses $user->user_id matching app_id. We need app_id here strictly speaking?
                // For now allow registration with default values.

                await sequelize.query(insertQuery, {
                    replacements: {
                        name: name || '',
                        email: email || '',
                        phone
                    }
                });

                const [newUser] = await sequelize.query(query, {
                    replacements: { phone },
                    type: QueryTypes.SELECT
                });

                res.json({
                    success: true,
                    message: 'Registration Completed Successfully',
                    user_details: newUser
                });
            }
        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    get_content_list: async (req, res) => {
        try {
            const { module_id } = req.params;
            const { app_id } = req.query; // Expect ?app_id=... from mobile app

            let whereClause = { function_id: module_id, status: '1' };

            if (app_id) {
                // Find user by app_id
                let user = await User.findOne({ where: { app_id } });

                // Fallback if app_id is numeric ID
                if (!user && !isNaN(app_id)) {
                    user = await User.findByPk(app_id);
                }

                if (user) {
                    // Filter by this user's ID
                    whereClause.user_id = user.user_id;
                }
            }

            const content = await FunctionAllot.findAll({
                where: whereClause,
                order: [['sort_order', 'ASC'], ['function_allot_id', 'DESC']]
            });

            // Fetch Fields Structure to map field names
            const fields = await FunctionField.findAll({
                where: { function_id: module_id, status: '1' }
            });
            const fieldMap = {};
            fields.forEach(f => { fieldMap[f.function_field_id] = f.name; });

            // Fetch all FieldValues for the fetched items
            const allotIds = content.map(c => c.function_allot_id);
            let mappedContent = [];

            if (allotIds.length > 0) {
                const values = await FieldValue.findAll({
                    where: { function_allot_id: allotIds }
                });

                mappedContent = content.map(c => {
                    const itemData = c.toJSON();
                    // Inject dynamic fields directly into the object
                    values.forEach(v => {
                        if (v.function_allot_id === itemData.function_allot_id) {
                            const fieldName = fieldMap[v.function_field_id];
                            if (fieldName) {
                                itemData[fieldName] = v.value;
                            }
                        }
                    });
                    return itemData;
                });
            }

            res.json({ success: true, content: mappedContent.length > 0 ? mappedContent : content });
        } catch (error) {
            console.error("Error fetching content list:", error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    get_content_detail: async (req, res) => {
        try {
            const { item_id } = req.params;

            const item = await FunctionAllot.findByPk(item_id);
            if (!item) {
                return res.status(404).json({ success: false, message: 'Item not found' });
            }

            const values = await FieldValue.findAll({ where: { function_allot_id: item_id } });
            const valuesMap = {};
            values.forEach(v => { valuesMap[`field_${v.function_field_id}`] = v.value; });

            // Fetch Fields Structure to produce a nice blended response?
            // Or just return valuesMap and let frontend handle it? 
            // Better to return the structure too so frontend knows what field_123 means.

            const fields = await FunctionField.findAll({
                where: { function_id: item.function_id, status: '1' },
                include: [{ model: FieldType }],
                order: [['field_order', 'ASC']]
            });

            // Resolve Relations (Type 7)
            const relations = {};
            for (const field of fields) {
                if (field.field_type_id === 7) {
                    const key = `field_${field.function_field_id}`;
                    const val = valuesMap[key];
                    if (val) {
                        try {
                            // Value is likely JSON array of Strings: '["8","25"]'
                            let ids = [];
                            if (val.startsWith('[')) {
                                ids = JSON.parse(val);
                            } else {
                                ids = [val];
                            }

                            // Ensure ids are numbers/strings suitable for query
                            if (ids && ids.length > 0) {
                                const relatedItems = await FunctionAllot.findAll({
                                    attributes: ['function_allot_id', 'title', 'event_date', 'time_from'],
                                    where: { function_allot_id: ids }
                                });
                                relations[key] = relatedItems;
                            }
                        } catch (e) {
                            console.error("Error parsing relation value", e);
                        }
                    }
                }
            }

            res.json({
                success: true,
                item,
                values: valuesMap,
                fields,
                relations
            });

        } catch (error) {
            console.error("Error fetching content detail:", error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    get_upcoming_events: async (req, res) => {
        try {
            const { app_id } = req.query;
            let userId = 0;

            if (app_id) {
                let user = await User.findOne({ where: { app_id } });
                if (!user && !isNaN(app_id)) user = await User.findByPk(app_id);
                if (user) userId = user.user_id;
            }

            // Find all modules that are 'events' or where we expect dates.
            // A more robust way is to query FunctionAllot where event_date >= CURDATE()
            let whereClause = { status: '1' };
            if (userId > 0) {
                whereClause.user_id = userId;
            }

            const upcomingEventsQuery = `
                SELECT fa.function_allot_id, fa.title, fa.event_date, fa.time_from, fa.image, fa.function_id
                FROM functions_allot fa
                JOIN functions f ON fa.function_id = f.function_id
                WHERE fa.status = '1' 
                AND f.name LIKE '%Event%'
                ${userId > 0 ? 'AND fa.user_id = :user_id' : ''}
                ORDER BY fa.function_allot_id DESC
                LIMIT 5
            `;

            const upcomingEvents = await sequelize.query(upcomingEventsQuery, {
                replacements: { user_id: userId },
                type: QueryTypes.SELECT
            });

            // Map image to full URL safely (Cloudinary or local)
            const mappedEvents = upcomingEvents.map(e => {
                let imageUrl = e.image;
                if (imageUrl && !imageUrl.startsWith('http')) {
                    imageUrl = `https://club-api-project.vercel.app/uploads/${imageUrl}`;
                }
                return {
                    ...e,
                    image_url: imageUrl,
                    Date: e.event_date || "Upcoming",
                    Name: e.title
                };
            });

            res.json({ success: true, events: mappedEvents });

        } catch (error) {
            console.error("Error fetching upcoming events:", error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    get_app_settings: async (req, res) => {
        try {
            const { app_id } = req.params;
            let user_id;

            // Try to find user by app_id string first (e.g., 'jerry_app')
            const user = await User.findOne({ where: { app_id } });

            if (user) {
                user_id = user.user_id;
            } else if (!isNaN(app_id)) {
                // Fallback: If app_id is numeric and not found by string lookup, assume it's user_id
                user_id = app_id;
            } else if (app_id === 'jerry_app') {
                // Legacy fallback
                user_id = 1;
            }

            if (!user_id) return res.status(404).json({ success: false, message: 'App not found' });

            const settings = await AppSettings.findOne({ where: { user_id } });

            // Return defaults if no settings found
            const data = settings ? settings.toJSON() : {
                primary_color: '#000000',
                secondary_color: '#ffffff',
                background_color: '#f5f5f5',
                text_color: '#000000',
                logo_url: '',
                event_name: 'My Event',
                subtitle: 'Annual Conference'
            };

            res.json({ success: true, settings: data });

        } catch (error) {
            console.error("Error fetching app settings:", error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    }
};

module.exports = ApiController;
