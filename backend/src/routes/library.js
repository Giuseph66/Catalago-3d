import express from 'express';
import { getLibrary } from '../controllers/libraryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getLibrary);

export default router;
