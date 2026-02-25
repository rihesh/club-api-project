const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./src/config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test Database Connection
sequelize.authenticate()
    .then(() => console.log('Database connected...'))
    .catch(err => console.log('Error: ' + err));

// Routes
const apiRoutes = require('./src/routes/api');
const adminRoutes = require('./src/routes/admin');
const cmsRoutes = require('./src/routes/cms');

app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/stripe', require('./src/routes/stripe'));
app.use('/api/upload', require('./src/routes/upload'));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('EventApp Backend Running');
});

if (process.env.NODE_ENV !== 'vercel') {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;
