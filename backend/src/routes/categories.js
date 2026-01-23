import express from 'express';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateCategory, handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

// Rotas públicas
router.get('/', listCategories);
router.get('/:id', getCategory);

// Rotas protegidas
router.post('/', authenticateToken, validateCategory, handleValidationErrors, createCategory);
router.put('/:id', authenticateToken, validateCategory, handleValidationErrors, updateCategory);
router.delete('/:id', authenticateToken, deleteCategory);

export default router;

