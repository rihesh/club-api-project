const { Function } = require('./src/models');
const initApp = async () => {
  const fns = await Function.findAll();
  console.log(JSON.stringify(fns, null, 2));
  process.exit(0);
}
initApp();
