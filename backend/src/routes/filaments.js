import express from 'express';
import {
    getFilaments,
    createFilament,
    updateFilament,
    deleteFilament
} from '../controllers/filamentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getFilaments);
router.post('/', authenticateToken, createFilament);
router.put('/:id', authenticateToken, updateFilament);
router.delete('/:id', authenticateToken, deleteFilament);

export default router;
