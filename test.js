const { FunctionField, FieldValue, sequelize } = require('./src/models');
async function run() {
  const fields = await FunctionField.findAll({ where: { function_id: 10075, status: '1' }});
  console.log("Fields:", fields.map(f => ({id: f.function_field_id, name: f.name})));
  const values = await FieldValue.findAll({ where: { function_allot_id: 700 }});
  console.log("Values:", values.map(v => ({allot_id: v.function_allot_id, field_id: v.function_field_id, value: v.value})));
}
run();
