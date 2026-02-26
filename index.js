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
// Apply body-parser only to non-upload routes, as Multer needs the raw stream
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/upload')) {
        next();
    } else {
        bodyParser.json()(req, res, (err) => {
            if (err) return next(err);
            bodyParser.urlencoded({ extended: true })(req, res, next);
        });
    }
});

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

app.get('/api/debug-env', (req, res) => {
    const secret = process.env.CLOUDINARY_API_SECRET;
    res.json({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key_len: process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.length : 0,
        api_secret_len: secret ? secret.length : 0,
        secret_starts_with: secret ? secret.substring(0, 2) : null,
        secret_ends_with: secret ? secret.substring(secret.length - 2) : null,
        has_quotes: secret ? (secret.startsWith('"') || secret.startsWith("'")) : false,
        has_spaces: secret ? (secret.trim().length !== secret.length) : false,
        is_vercel: process.env.VERCEL === '1',
        node_env: process.env.NODE_ENV
    });
});

if (process.env.NODE_ENV !== 'vercel') {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;
