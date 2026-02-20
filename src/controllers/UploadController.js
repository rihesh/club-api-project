const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure uploads directory exists
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Unique filename: timestamp + random + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        console.log('Processing file upload:', file.originalname, 'Mimetype:', file.mimetype);
        // Accept images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            console.error('File rejected (invalid mimetype):', file.mimetype);
            cb(new Error('Only image and video files are allowed!'), false);
        }
    }
});

const UploadController = {
    // Middleware for handling single file upload
    uploadMiddleware: upload.single('file'),

    // Handler for upload response
    uploadFile: (req, res) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Return the file URL (assuming server is running on localhost:3000)
        // Ideally, base URL should be from env or config
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                url: fileUrl,
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });
    }
};

module.exports = UploadController;
