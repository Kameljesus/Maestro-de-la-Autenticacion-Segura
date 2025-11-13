// protectedRoutes.js

// Imports:
import express from 'express'

// Creamos router:
const router = express.Router()

// Ruta protegida:
router.get('/', (req, res) => {
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