// middlewares/rate-limit.js

import rateLimit from 'express-rate-limit'

// Limitar intentos de login: máximo 5 intentos cada 15 minutos
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 requests
  message: 'Demasiados intentos de login. Por favor, intentá de nuevo en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Limitar registro: máximo 3 registros cada hora
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  message: 'Demasiados registros desde esta IP. Por favor, intentá de nuevo más tarde.',
})