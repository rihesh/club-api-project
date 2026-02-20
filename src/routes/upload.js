const express = require('express');
const router = express.Router();
const UploadController = require('../controllers/UploadController');

// POST /api/upload
router.post('/', UploadController.uploadMiddleware, UploadController.uploadFile);

module.exports = router;
