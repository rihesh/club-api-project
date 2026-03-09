const sequelize = require('./src/config/database');
async function test() {
    try {
        const res = await sequelize.query("SELECT function_id, function_name, description, status, category, function_org_name, is_highlighted FROM functions ORDER BY function_order ASC");
        console.log("Success, got", res[0].length, "rows");
    } catch (e) {
        console.error(e.message);
    }
    process.exit();
}
test();
