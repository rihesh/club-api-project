const { AppSettings } = require('./src/models');
async function run() {
  await AppSettings.update({ stripe_account_id: null }, { where: { user_id: 91 } });
  console.log("Cleared old Stripe Account ID from Database.");
}
run();
