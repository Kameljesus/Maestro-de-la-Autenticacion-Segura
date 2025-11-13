// middlewares/auth-middleware.js

import jwt from 'jsonwebtoken'
import { SECRET_JWT_KEY } from '../config.js'
import db from '../model/db.js'

export const authMiddleware = async (req, res, next) => {
  req.session = { user: null }

  // 1️⃣ Verificar JWT desde header Authorization
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // "Bearer TOKEN"
  
  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET_JWT_KEY)
      req.session.user = {
        id: decoded.id,
        username: decoded.username,
        admin: decoded.admin
      }
      return next()
    } catch (error) {
      console.log('JWT inválido o expirado')
    }
  }

  // 2️⃣ Verificar Cookie de sesión
  const sessionId = req.cookies.session

  if (sessionId) {
    try {
      // Buscamos el usuario en SQLite usando db
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT id, username, admin FROM users WHERE id = ?', [sessionId], (err, row) => {
          if (err) reject(err)
          else resolve(row)
        })
      })

      if (user) {
        req.session.user = {
          id: user.id,
          username: user.username,
          admin: user.admin
        }
      }
    } catch (error) {
      console.log('Error al buscar usuario por sesión:', error)
    }
  }

  next()
}
