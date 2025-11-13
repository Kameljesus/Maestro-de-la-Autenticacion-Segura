// index.js

// Imports:
import express from 'express'
import cookieParser from 'cookie-parser';
import { PORT } from "./config.js"
import { authMiddleware } from './middlewares/auth-middleware.js';
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

// Rutas:
app.use('/register', registerRoutes)
app.use('/login', loginRoutes)
app.use('/protected', protectedRoutes)
app.use('/refresh', tokenRoutes)
app.use('/logout', logoutRoutes)


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