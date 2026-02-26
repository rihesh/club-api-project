require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("Testing with Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key exists:", !!process.env.CLOUDINARY_API_KEY);
console.log("API Secret exists:", !!process.env.CLOUDINARY_API_SECRET);

// Create a 1x1 dummy PNG buffer
const pngBuffer = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082', 'hex');

async function run() {
    try {
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'event_app_test', resource_type: 'auto' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(pngBuffer);
        });
        console.log("Success! File uploaded to:", uploadResult.secure_url);
    } catch (err) {
        console.error("Local Upload Failed:", err.message || err);
    }
}

run();
