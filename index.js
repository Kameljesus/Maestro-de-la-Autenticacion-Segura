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

// Middleware para pasar el token CSRF a todas las vistas
// Esto genera el token antes de llegar a las rutas
app.use((req, res, next) => {
  // Solo aplicar CSRF a rutas que necesitan renderizar formularios
  if (req.path === '/' || 
      req.path.startsWith('/register') || 
      req.path.startsWith('/login') || 
      req.path.startsWith('/protected') ||
      req.path.startsWith('/logout') ||
      req.path.startsWith('/admin')) {
    
    // Aplicar el middleware CSRF
    csrfProtection(req, res, (err) => {
      if (err) {
        return next(err)
      }
      // Una vez aplicado, el token estará disponible
      res.locals.csrfToken = req.csrfToken()
      next()
    })
  } else {
    // Para rutas que no necesitan CSRF (como /user, /refresh)
    res.locals.csrfToken = null
    next()
  }
})

// Rutas:
app.use('/register', registerLimiter, registerRoutes)
app.use('/login', loginLimiter, loginRoutes)
app.use('/protected', protectedRoutes)
app.use('/refresh', tokenRoutes)  // No necesita CSRF
app.use('/logout', logoutRoutes)
app.use('/user', userRoutes)      // No necesita CSRF (usa JWT)
app.use('/admin', adminRoutes)


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