const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
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

// --- Active Storage Selection ---
// For Vercel, we MUST use memory storage. Disk storage (even temporary) will crash.
const storage = useCloudStorage
    ? multer.memoryStorage()
    : multer.diskStorage({
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

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed!'), false);
        }
    }
});

const UploadController = {
    // We use .single('file') to parse the multipart form.
    // If memoryStorage is used, the file is buffered in req.file.buffer
    uploadMiddleware: (req, res, next) => {
        const singleUpload = upload.single('file');
        singleUpload(req, res, (err) => {
            if (err) {
                console.error("Multer parse error:", err);
                let errorMessage = "Multer Error processing upload.";
                if (typeof err === 'string') errorMessage = err;
                else if (err instanceof Error) errorMessage = err.message;
                else if (err && typeof err === 'object') errorMessage = JSON.stringify(err);

                return res.status(500).json({ success: false, message: errorMessage, errorType: typeof err });
            }
            next();
        });
    },

    uploadFile: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            let fileUrl = '';
            let filename = '';

            if (useCloudStorage) {
                // We are on Vercel. We must stream the buffer directly to Cloudinary.
                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'event_app_uploads', resource_type: 'auto' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });

                fileUrl = uploadResult.secure_url;
                filename = uploadResult.public_id;
            } else {
                // Local disk storage
                fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
                filename = req.file.filename;
            }

            res.json({
                success: true,
                message: 'File uploaded successfully',
                file: {
                    filename: filename,
                    url: fileUrl,
                    mimetype: req.file.mimetype,
                    size: req.file.size
                }
            });
        } catch (error) {
            console.error("Upload process error:", error);

            // Extract meaningful message from Cloudinary error object if present
            let errorMessage = 'Error processing upload. See server logs for details.';
            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error && typeof error === 'object') {
                errorMessage = JSON.stringify(error);
            }

            res.status(500).json({
                success: false,
                message: errorMessage
            });
        }
    }
};

module.exports = UploadController;
