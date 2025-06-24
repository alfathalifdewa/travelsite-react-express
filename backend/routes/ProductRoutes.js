import express from 'express';
import {
  getProducts,
  getProductsById,
  postProducts,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} from '../controllers/productController.js';
import { adminMiddleware, authMiddleware } from '../middleware/UserMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

// IMPORTANT: Place specific routes before dynamic routes
router.get('/category/:id_category', getProductsByCategory);
router.get('/', getProducts);
router.get('/:id', getProductsById);

// Add multer middleware for handling file uploads
router.post('/', 
  authMiddleware, 
  adminMiddleware, 
  upload.array('images', 10), // Handle up to 10 images
  postProducts
);

router.put('/:id', 
  authMiddleware, 
  adminMiddleware, 
  upload.array('images', 10), // Handle up to 10 images for updates
  updateProduct
);

router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

export default router;