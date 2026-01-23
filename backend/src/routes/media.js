import express from 'express';
import {
  uploadMedia,
  reorderMedia,
  setCapa,
  deleteMedia
} from '../controllers/mediaController.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../config/upload.js';

const router = express.Router();

// Todas as rotas de mídia são protegidas
router.post('/:produtoId/media', authenticateToken, upload.single('file'), uploadMedia);
router.put('/:produtoId/media/reorder', authenticateToken, reorderMedia);
router.put('/:produtoId/media/:mediaId/capa', authenticateToken, setCapa);
router.delete('/:produtoId/media/:mediaId', authenticateToken, deleteMedia);

export default router;

