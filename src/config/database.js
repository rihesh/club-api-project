const { Sequelize } = require('sequelize');
require('dotenv').config();

// If on Vercel, it uses Railway DB credentials. Otherwise, it defaults to local DB credentials.
const useCloudDb = process.env.NODE_ENV === 'vercel';

const dbName = useCloudDb ? process.env.RAILWAY_DB_NAME : (process.env.DB_NAME || 'products_event2');
const dbUser = useCloudDb ? process.env.RAILWAY_DB_USER : (process.env.DB_USER || 'root');
const dbPass = useCloudDb ? process.env.RAILWAY_DB_PASS : (process.env.DB_PASS || 'Rihesh@123');
const dbHost = useCloudDb ? process.env.RAILWAY_DB_HOST : (process.env.DB_HOST || 'localhost');
const dbPort = useCloudDb ? process.env.RAILWAY_DB_PORT : (process.env.DB_PORT || 3306);

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
