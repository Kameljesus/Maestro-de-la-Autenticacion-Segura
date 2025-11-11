// index.js

// Imports:
import express from 'express'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';
import { PORT, SECRET_JWT_KEY } from "./config.js"
import { Register } from './controllers/register.js'
import { Login } from "./controllers/login.js"
import { authMiddleware } from './controllers/auth-middleware.js';
import path from 'path' // necesario para manejar rutas de carpetas

const app = express()


// Middlewares:
app.use(express.json())                          // JSON (string que llega en la petición) ---> Objeto JavaScript (req.body)
app.use(express.urlencoded({ extended: true }))  // Para formularios HTML (application/x-www-form-urlencoded)
app.use(cookieParser());                         // necesario para leer cookies
app.use(authMiddleware);                         // todas las rutas después podrán usar req.session.user

// Configuración de vistas EJS:
app.set('view engine', 'ejs') // le decimos a Express que vamos a usar EJS
app.set('views', path.resolve('./views')) // carpeta donde van tus archivos .ejs


// Ruta que le va a mostrar al cliente el menú para registrarse o logearse 
app.get('/', (req, res) => {
  // Por ahora no hay usuario logueado, así que user = null
  res.render('index', { 
    user: null, 
    message: 'Bienvenido! Por favor elige una opción:' 
  })
})


// Ruta para mostrar la página para registrarse:
app.get('/register', (req, res) => {
  res.render('register')
})


// Ruta que sirve para que el cliente se registre.
app.post('/register', async (req, res) => {
  // 1. Recibe el username y el password que elige el cliente:
  const { username, password } = req.body

  // 2. Verifica si están los dos elementos necesarios (nombre y contraseña):
  if (!username || !password) {

    // Renderizamos la misma vista de registro con un mensaje de error
    return res.render('register', { 
      error: 'Todos los campos son obligatorios', 
      username: '', 
      password: '' 
    });
  }

  // 3. Intentamos registrarlo y guardarlo en la base de datos:
  try {
    const id = await Register.create({ username, password })
    // Renderizamos una página de éxito (o redirigimos al login)
    res.render('login', { 
      success: 'Usuario registrado correctamente, ya podés iniciar sesión!',
      username: '' 
    })

  } catch (error) {
    // Renderizamos de nuevo la vista de registro con el error
    res.render('register', {
      username,
      password: '' // nunca mostramos la contraseña
    })
  }
})


// Ruta para mostrar la página para logearse:
app.get('/login', (req, res) => {
  res.render('login')
})


// Ruta para iniciar sesión:
app.post('/login', async (req, res) => {
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


// Ruta para refrescar el token:
app.post('/refresh', (req, res) => {
  // 1. Obtener refresh token del body o cookie
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).send('Missing refresh token');
  }

  try {
    // 2. Verificar que el refresh token sea válido
    const decoded = jwt.verify(refreshToken, SECRET_JWT_KEY);

    // 3. Generar un nuevo access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, username: decoded.username, admin: decoded.admin },
      SECRET_JWT_KEY,
      { expiresIn: '1h' } // misma duración que antes
    );

    // 4. Devolver el token al cliente
    return res.send({
      message: 'Access token refreshed',
      accessToken: newAccessToken
    });

  } catch (error) {
    return res.status(401).send('Invalid or expired refresh token');
  }
});


// Ruta protegida:
app.get('/protected', (req, res) => {
  const { user } = req.session

  // 1. Si no hay usuario en la sesión, redirigimos al login con mensaje
  if (!user) {
    return res.render('login', {
      error: 'Debes iniciar sesión para acceder a esta página',
      username: '',
      authType: ''
    })
  }

  // 2. Si el usuario está autenticado, renderizamos la vista protegida
  res.render('protected', {
    user, // contiene id, username y admin
    message: '¡Bienvenido de vuelta!',
    authType: req.cookies.session ? 'cookie' : 'jwt'
  })
})


// Ruta para cerrar sesión:
app.post('/logout', (req, res) => {
  // 1. Limpiamos la cookie de sesión si existe
  res.clearCookie('session');
  
  // 2. Renderizamos la vista de inicio con mensaje de éxito
  res.render('index', {
    user: null, 
    message: 'Has cerrado sesión correctamente. ¡Hasta luego!'
  })
})


app.listen(PORT, () => {
  console.log(`✅ Server running on port: ${PORT}`)
})