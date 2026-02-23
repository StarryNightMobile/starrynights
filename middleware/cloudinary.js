import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware function to upload a file
export const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'starrynights', // optional folder in Cloudinary
      resource_type: 'auto'   // automatically detect file type
    });

    // Remove the local file after upload
    fs.unlinkSync(req.file.path);

    // Attach Cloudinary URL to request object for controller use
    req.file.cloudinaryUrl = result.secure_url;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Cloudinary upload failed', error: err.message });
  }
};