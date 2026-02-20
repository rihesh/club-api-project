require('dotenv').config();
const { FunctionField, FieldValue } = require('./src/models');

async function test() {
    try {
        const fields = await FunctionField.findAll({ where: { function_id: 10075, status: '1' } });
        console.log("Fields returned:", fields.map(f => ({ id: f.function_field_id, name: f.name })));

        const values = await FieldValue.findAll({ where: { function_allot_id: 700 } });
        console.log("Values returned:", values.map(v => ({ alot_id: v.function_allot_id, field_id: v.function_field_id, val: v.value })));
    } catch (e) {
        console.error(e);
    }
}
test();
