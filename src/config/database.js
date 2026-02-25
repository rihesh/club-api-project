const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2'); // Explicitly require to force Vercel to include it in the build
require('dotenv').config();

// Directly check for Railway variables first. If they exist (like in Vercel), use them.
// Otherwise, try the standard DB_ variables, and finally default to localhost logic.
const dbName = process.env.RAILWAY_DB_NAME || process.env.DB_NAME || 'products_event2';
const dbUser = process.env.RAILWAY_DB_USER || process.env.DB_USER || 'root';
const dbPass = process.env.RAILWAY_DB_PASS || process.env.DB_PASS || 'Rihesh@123';
const dbHost = process.env.RAILWAY_DB_HOST || process.env.DB_HOST || 'localhost';
const dbPort = process.env.RAILWAY_DB_PORT || process.env.DB_PORT || 3306;

const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPass,
  {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    logging: false,
  }
);

module.exports = sequelize;
