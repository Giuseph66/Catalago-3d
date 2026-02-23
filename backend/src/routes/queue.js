import express from 'express';
import {
    getQueue,
    createJob,
    updateJobStatus,
    deleteJob,
    updateQueueOrder
} from '../controllers/printQueueController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getQueue);
router.post('/', authenticateToken, createJob);
router.put('/reorder', authenticateToken, updateQueueOrder);
router.put('/:id', authenticateToken, updateJobStatus);
router.delete('/:id', authenticateToken, deleteJob);

export default router;
