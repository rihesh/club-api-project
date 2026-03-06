const sequelize = require('../src/config/database');
const { Booking, FunctionModel, TicketTier } = require('../src/models');

async function syncAll() {
    try {
        await sequelize.authenticate();
        console.log('Syncing TicketTier table...');
        await TicketTier.sync({ alter: true });
        console.log('Syncing Booking table...');
        await Booking.sync({ alter: true });
        console.log('Syncing Function table...');
        await FunctionModel.sync({ alter: true });
        console.log('Done.');
    } catch (e) {
        console.error('Error syncing:', e);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}
syncAll();
