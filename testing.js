// index.js

// Imports Libraries:
import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import csrf from 'csurf'
import { PORT } from "./config.js"
import { authMiddleware } from './middlewares/auth-middleware.js'
import { loginLimiter, registerLimiter } from './middlewares/rate-limit.js'
import path from 'path'

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
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Configurar CSRF
const csrfProtection = csrf({ cookie: true })

app.use(authMiddleware)

// Configurar headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}))

// Configuración de vistas EJS:
app.set('view engine', 'ejs')
app.set('views', path.resolve('./views'))

// ⬅️ SOLUCIÓN: Aplicar csrfProtection a TODAS las rutas que renderizan vistas
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

// Rutas (ahora SIN csrfProtection porque ya se aplicó arriba)
app.use('/register', registerLimiter, registerRoutes)
app.use('/login', loginLimiter, loginRoutes)
app.use('/protected', protectedRoutes)
app.use('/refresh', tokenRoutes)  // No necesita CSRF
app.use('/logout', logoutRoutes)
app.use('/user', userRoutes)      // No necesita CSRF (usa JWT)
app.use('/admin', adminRoutes)

// Ruta principal
app.get('/', (req, res) => {
  res.render('index', { 
    user: null, 
    message: 'Bienvenido! Por favor elige una opción:' 
  })
})

app.listen(PORT, () => {
  console.log(`✅ Server running on port: ${PORT}`)
})