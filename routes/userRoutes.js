// routes/userRoutes.js

// Imports:
import express from 'express'
import jwt from 'jsonwebtoken'
import { SECRET_JWT_KEY } from '../config.js'

// Creamos router:
const router = express.Router()


// Ruta de vista de usuario (SOLO con JWT):
router.get('/', (req, res) => {
  // 1. Obtener el token del header Authorization
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  // 2. Si no hay token, mostrar error:
  if (!token) {
    return res.status(401).render('error', {
      message: '❌ Acceso denegado. Necesitás un token JWT para ver esta página.',
      detail: 'Esta página requiere autenticación con JWT. Iniciá sesión con JWT para obtener tu token.'
    })
  }

  // 3. Verificar el token:
  try {
    const decoded = jwt.verify(token, SECRET_JWT_KEY)
    
    // 4. Si el token es válido, mostrar la vista de usuario
    res.render('user-view', {
      user: decoded,
      message: `¡Hola ${decoded.username}, esta es tu página!`
    })

  } catch (error) {
    return res.status(403).render('error', {
      message: '❌ Token inválido o expirado',
      detail: 'Tu token JWT no es válido. Por favor, iniciá sesión nuevamente.'
    })
  }
})

// Exportamos el router:
export default router