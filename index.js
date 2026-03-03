const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require(path.join(__dirname, 'src/config/database'));
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Apply body-parser only to non-upload and non-webhook routes
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/upload') || req.originalUrl.startsWith('/api/stripe/webhook')) {
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
    .catch(err => console.error('Database Connection Error:', err));

// Routes - Using path.join for absolute resolution in Vercel
app.use('/api', require(path.join(__dirname, 'src/routes/api')));
app.use('/api/admin', require(path.join(__dirname, 'src/routes/admin')));
app.use('/api/cms', require(path.join(__dirname, 'src/routes/cms')));
app.use('/api/stripe', require(path.join(__dirname, 'src/routes/stripe')));
app.use('/api/booking', require(path.join(__dirname, 'src/routes/booking')));
app.use('/api/upload', require(path.join(__dirname, 'src/routes/upload')));

try {
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
} catch (e) { }

app.get('/', (req, res) => {
    res.send('EventApp Backend Running');
});

if (process.env.NODE_ENV !== 'vercel') {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;
