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

const router = express.Router();

// IMPORTANT: Place specific routes before dynamic routes
router.get('/category/:id_category', getProductsByCategory);
router.get('/', getProducts);
router.get('/:id', getProductsById);

// Remove multer middleware since we're handling uploads on frontend
router.post('/', authMiddleware, adminMiddleware, postProducts);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

export default router;