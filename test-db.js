const sequelize = require('./src/config/database');

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log(`Connection to ${process.env.NODE_ENV === 'vercel' ? 'Railway' : 'Local'} database has been established successfully.`);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

testConnection();
