import { body, validationResult } from 'express-validator';

export const validateProduct = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('peso').isInt({ min: 1 }).withMessage('Peso deve ser um número inteiro maior que 0'),
  body('status').isIn(['PRONTA_ENTREGA', 'SOB_ENCOMENDA']).withMessage('Status inválido'),
  body('categorias').optional().isArray().withMessage('Categorias deve ser um array'),
  body('tags').optional().isArray().withMessage('Tags deve ser um array'),
];

export const validateProductUpdate = [
  body('nome').optional().trim().notEmpty().withMessage('Nome não pode ser vazio'),
  body('peso').optional().isInt({ min: 1 }).withMessage('Peso deve ser um número inteiro maior que 0'),
  body('status').optional().isIn(['PRONTA_ENTREGA', 'SOB_ENCOMENDA']).withMessage('Status inválido'),
  body('categorias').optional().isArray().withMessage('Categorias deve ser um array'),
  body('tags').optional().isArray().withMessage('Tags deve ser um array'),
];

export const validateCategory = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
];

export const validateTestimonial = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('texto').trim().notEmpty().withMessage('Texto é obrigatório'),
  body('nota').optional().isInt({ min: 1, max: 5 }).withMessage('Nota deve ser entre 1 e 5'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

export const validateRegister = [
  body('nome')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
];

export const validateUserUpdate = [
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('isActive').optional().isBoolean().withMessage('isActive deve ser true ou false'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
