// auth-middleware.js
import jwt from 'jsonwebtoken';
import { SECRET_JWT_KEY } from './config.js';

export const authMiddleware = (req, res, next) => {
  // Inicializamos la sesión en null
  req.session = { user: null };

  // Intentamos obtener el token de la cookie 'session'
  const token = req.cookies?.session;

  // Verificamos el token si existe
  if (token) {
    try {
      const data = jwt.verify(token, SECRET_JWT_KEY);
      // Guardamos la info del usuario en la sesión para que las vistas la lean
      req.session.user = {
        id: data.id,
        username: data.username,
        admin: data.admin || false
      };
    } catch (err) {
      req.session.user = null; // token inválido o expirado
    }
  }

  next(); // Pasamos a la ruta o siguiente middleware
};
