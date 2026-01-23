import express from 'express';
import {
  listProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateProduct, validateProductUpdate, handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

// Rotas públicas
router.get('/', listProducts);

// Rotas protegidas (admin) - devem vir antes das rotas com parâmetros dinâmicos
router.get('/admin/:id', authenticateToken, getProductById);
router.post('/', authenticateToken, validateProduct, handleValidationErrors, createProduct);
router.put('/:id', authenticateToken, validateProductUpdate, handleValidationErrors, updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);

// Rota pública com slug (deve vir por último para não capturar outras rotas)
router.get('/:slug', getProductBySlug);

export default router;

