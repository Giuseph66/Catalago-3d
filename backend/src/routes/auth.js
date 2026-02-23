import express from 'express';
import {
  deleteUser,
  listUsers,
  login,
  register,
  updateUser,
  verifyToken,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  handleValidationErrors,
  validateLogin,
  validateRegister,
  validateUserUpdate,
} from '../utils/validators.js';

const router = express.Router();

router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/register', authenticateToken, validateRegister, handleValidationErrors, register);
router.get('/verify', authenticateToken, verifyToken);
router.get('/users', authenticateToken, listUsers);
router.put('/users/:id', authenticateToken, validateUserUpdate, handleValidationErrors, updateUser);
router.delete('/users/:id', authenticateToken, deleteUser);

export default router;
