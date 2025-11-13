// loginRoutes.js

// Imports
import express from 'express'
import { Login } from "./controllers/login.js"

// Creamos router:
const router = express.Router()


// Ruta para mostrar la página para logearse:
router.get('/', (req, res) => {
  res.render('login')
})


// Ruta para iniciar sesión:
router.post('/', async (req, res) => {
  // 1. Recibe el username y el password que escribe el cliente:
  const { username, password, authType } = req.body;

  // 2. Verifica si están los dos elementos necesarios (nombre y contraseña):
  if (!username || !password || !authType) {
    return res.render('login', {
      error: 'Todos los campos son obligatorios', 
      username: '', 
      authType: ''
    })
  }

  // 3. Chequeamos al usuario:
  try {
    const user = await Login.authenticate({ username, password })
  
  // 4. El cliente elige su inicio de sesión:
    
    // 🧱 Caso 1: JWT (SIN ESTADO)
    if (authType === 'jwt') {
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, admin: user.admin },
        SECRET_JWT_KEY,
        { expiresIn: '1h' }
      )

      const refreshToken = jwt.sign(
        { id: user.id },
        SECRET_JWT_KEY,
        { expiresIn: '7d' }
      )


      // ✅ NO guardamos en cookies, enviamos los tokens en la vista
      return res.render('protected', { 
        user, 
        message: 'Login con JWT exitoso',
        authType: 'jwt',
        accessToken,      // ⬅️ Lo enviamos a la vista
        refreshToken      // ⬅️ Lo enviamos a la vista
      })
    }

    // 🧱 Caso 2: Cookie (CON ESTADO)
    else if (authType === 'cookie') {
      res.cookie('session', user.id, {
        httpOnly: true, // Solo el servidor puede leer esta cookie (más seguro).
        secure: process.env.NODE_ENV === 'production', // Solo se envía por HTTPS en producción.
        sameSite: 'strict', // Evita que se envíe desde otros sitios (protege de ataques CSRF).
        maxAge: 1000 * 60 * 60 // Dura 1 hora antes de expirar.
      })

      // Renderizamos la vista protegida con mensaje de éxito
      return res.render('protected', { 
        user, 
        message: 'Login con Cookie exitoso',
        authType: 'cookie'
      })
    }

    // Si no especifica o es otro caso que no existe:
    else {
      return res.render('login', { 
        error: 'Tipo de autenticación inválido', 
        username, 
        authType
      })
    }

  } catch (err) {
    res.render('login', { 
      error: err.message, 
      username, 
      authType 
    })
  }
})