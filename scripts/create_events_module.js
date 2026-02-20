const { sequelize, Function: FunctionModel, FunctionField } = require('../src/models');

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Create Function (Events)
        const newFn = await FunctionModel.create({
            function_name: 'Events',
            description: 'Custom Events module with Ticketing Support',
            status: '1',
            category: '1',
            function_org_name: 'Events', // important identifier
            setting: '0', // standard module
            date_filter: '0',
            multiple: '1', // allow multiple items (records)
            function_order: 10,
            show_user: '1', // 1 means visible to App Admin
            user_type: 0,
            identification: 0
        });

        console.log(`Created Events module with ID: ${newFn.function_id}`);

        // 2. Create Fields for Events
        const fields = [
            { function_id: newFn.function_id, field_type_id: 1, name: 'Event Title', description: '', status: '1', order: 1, options: '' },
            { function_id: newFn.function_id, field_type_id: 2, name: 'Event Description', description: '', status: '1', order: 2, options: '' },
            { function_id: newFn.function_id, field_type_id: 11, name: 'Image', description: '', status: '1', order: 3, options: '' },
            { function_id: newFn.function_id, field_type_id: 1, name: 'Location Name', description: '', status: '1', order: 4, options: '' },
            { function_id: newFn.function_id, field_type_id: 21, name: 'Location URL', description: '', status: '1', order: 5, options: '' },
            // Is Ticket Event? (dropdown with yes/no)
            { function_id: newFn.function_id, field_type_id: 7, name: 'Is Ticket Event?', description: '', status: '1', order: 6, options: 'Yes,No' },
            // Ticket Amount (number)
            { function_id: newFn.function_id, field_type_id: 20, name: 'Ticket Amount', description: '', status: '1', order: 7, options: '' }
        ];

        for (const field of fields) {
            await FunctionField.create(field);
        }

        console.log('Created fields successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Error creating module:', error);
        process.exit(1);
    }
};

run();
