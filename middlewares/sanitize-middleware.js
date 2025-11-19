// middlewares/sanitize-middleware.js

import { body, validationResult } from 'express-validator'

// Middleware para sanitizar inputs
export const sanitizeInput = [
  // Sanitizar username: solo letras, números y guión bajo
  body('username')
    .trim()                           // Eliminar espacios
    .escape()                         // Convertir <, >, &, ', " en entidades HTML
    .matches(/^[a-zA-Z0-9_]+$/)      // Solo alfanuméricos y guión bajo
    .withMessage('Username solo puede contener letras, números y guión bajo'),
  
  // Sanitizar password: no necesita escape porque se hashea
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password debe tener al menos 6 caracteres'),
]

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    // Si hay errores, renderizar con el primer error
    const firstError = errors.array()[0].msg
    
    return res.render(req.path.includes('register') ? 'register' : 'login', {
      error: firstError,
      success: null,
      username: req.body.username || '',
      password: '',
      authType: req.body.authType || ''
    })
  }
  
  next()
}