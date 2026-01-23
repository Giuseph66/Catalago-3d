import express from 'express';
import {
  getPublicConfig,
  getAdminConfig,
  updateConfig
} from '../controllers/configController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rota pública
router.get('/', getPublicConfig);

// Rotas protegidas
router.get('/admin', authenticateToken, getAdminConfig);
router.put('/', authenticateToken, updateConfig);

export default router;

