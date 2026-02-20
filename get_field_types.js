const { FieldType } = require('./src/models');
const run = async () => {
    const types = await FieldType.findAll();
    console.log(JSON.stringify(types, null, 2));
    process.exit();
}
run();
