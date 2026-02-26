const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const useCloudStorage = process.env.NODE_ENV === 'vercel' || process.env.VERCEL === '1';

// --- Cloudinary Configuration ---
if (useCloudStorage) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}
const cloudStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'event_app_uploads',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi'],
        resource_type: 'auto' // Important for accepting both images and videos
    }
});

// --- Local Disk Configuration ---
const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// --- Active Storage Selection ---
const storage = useCloudStorage ? cloudStorage : diskStorage;

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        console.log('Processing file upload:', file.originalname, 'Mimetype:', file.mimetype);
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            console.error('File rejected (invalid mimetype):', file.mimetype);
            cb(new Error('Only image and video files are allowed!'), false);
        }
    }
});

const UploadController = {
    uploadMiddleware: upload.single('file'),

    uploadFile: (req, res) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // If using Cloudinary, multer-storage-cloudinary attaches 'path' with the URL
        let fileUrl = '';
        if (useCloudStorage) {
            fileUrl = req.file.path;
        } else {
            fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename || req.file.public_id,
                url: fileUrl,
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });
    }
};

module.exports = UploadController;
