import express from 'express';
import {
  listTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} from '../controllers/testimonialController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateTestimonial, handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

// Rotas públicas
router.get('/', listTestimonials);

// Rotas protegidas
router.get('/:id', authenticateToken, getTestimonial);
router.post('/', authenticateToken, validateTestimonial, handleValidationErrors, createTestimonial);
router.put('/:id', authenticateToken, validateTestimonial, handleValidationErrors, updateTestimonial);
router.delete('/:id', authenticateToken, deleteTestimonial);

export default router;

