// index.js

// Imports Libraries:
import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import csrf from 'csurf'
import { PORT } from "./config.js"
import { authMiddleware } from './middlewares/auth-middleware.js'
import { loginLimiter, registerLimiter } from './middlewares/rate-limit.js'
import path from 'path' // necesario para manejar rutas de carpetas

// Import Routes:
import registerRoutes from './routes/registerRoutes.js'
import loginRoutes from './routes/loginRoutes.js'
import protectedRoutes from './routes/protectedRoutes.js'
import tokenRoutes from './routes/tokenRoutes.js'
import logoutRoutes from './routes/logoutRoutes.js'
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

const app = express()

// Middlewares:
app.use(express.json())                          // JSON (string que llega en la petición) ---> Objeto JavaScript (req.body)
app.use(express.urlencoded({ extended: true }))  // Para formularios HTML (application/x-www-form-urlencoded)
app.use(cookieParser())                          // necesario para leer cookies

// ⬅️ NUEVO: Configuración de CSRF
const csrfProtection = csrf({ cookie: true })

app.use(authMiddleware)                          // todas las rutas después podrán usar req.session.user

// ⬅️ NUEVO: Configurar headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Necesario para EJS
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}))

// Configuración de vistas EJS:
app.set('view engine', 'ejs') // le decimos a Express que vamos a usar EJS
app.set('views', path.resolve('./views')) // carpeta donde van tus archivos .ejs

// ⬅️ NUEVO: Middleware para pasar el token CSRF a todas las vistas
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken ? req.csrfToken() : null
  next()
})

// Rutas (agregar csrfProtection a rutas con formularios):
app.use('/register', registerLimiter, csrfProtection, registerRoutes)
app.use('/login', loginLimiter, csrfProtection, loginRoutes)
app.use('/protected', csrfProtection, protectedRoutes)
app.use('/refresh', tokenRoutes)  // No necesita CSRF (es API)
app.use('/logout', csrfProtection, logoutRoutes)
app.use('/user', userRoutes)      // No necesita CSRF (usa JWT)
app.use('/admin', csrfProtection, adminRoutes)


// Ruta que le va a mostrar al cliente el menú para registrarse o logearse 
app.get('/', (req, res) => {
  // Por ahora no hay usuario logueado, así que user = null
  res.render('index', { 
    user: null, 
    message: 'Bienvenido! Por favor elige una opción:' 
  })
})

app.listen(PORT, () => {
  console.log(`✅ Server running on port: ${PORT}`)
})