// routes/logoutRoutes.js

// Imports:
import express from 'express'

// Creamos router:
const router = express.Router()

// Ruta para cerrar sesión:
router.post('/', (req, res) => {
  // 1. Limpiamos la cookie de sesión si existe
  res.clearCookie('session');
  
  // 2. Renderizamos la vista de inicio con mensaje de éxito
  res.render('index', {
    user: null, 
    message: 'Has cerrado sesión correctamente. ¡Hasta luego!'
  })
})

// Exportamos el router:
export default router