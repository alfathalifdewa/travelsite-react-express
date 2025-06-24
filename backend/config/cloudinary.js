// config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dgkxsc4ik',
  api_key: '614683239968781',
  api_secret: 'Qixol8DiprDTfpzRPJKg7h-GAqo',
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' }, // Resize large images
      { quality: 'auto' }, // Optimize quality
      { fetch_format: 'auto' } // Auto format optimization
    ],
    public_id: (req, file) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `product-${uniqueSuffix}`;
    },
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only! (jpeg, jpg, png, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10 // Maximum 10 files
  },
  fileFilter: fileFilter
});

// Helper function to delete image from Cloudinary
export const deleteCloudinaryImage = async (imageUrl) => {
  try {
    // Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const fileWithExtension = urlParts[urlParts.length - 1];
    const publicId = `products/${fileWithExtension.split('.')[0]}`;
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted image from Cloudinary: ${publicId}`, result);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

export { cloudinary, upload };
export default upload;