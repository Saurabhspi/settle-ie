const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure where and how files get stored in Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'settle-ie-documents', // folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto', // auto-detect image or pdf
    transformation: [{ quality: 'auto' }], // auto-optimise file size
  },
});

// Create the multer upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // accept the file
    } else {
      cb(new Error('Only JPG, PNG and PDF files are allowed'), false);
    }
  },
});

module.exports = { cloudinary, upload };