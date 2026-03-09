const sequelize = require('./src/config/database');
async function test() {
    try {
        const [rows] = await sequelize.query("DESCRIBE functions_user");
        console.log("functions_user schema:", rows);
    } catch(e) {
        console.error("Error:", e.message);
    }
    process.exit();
}
test();
