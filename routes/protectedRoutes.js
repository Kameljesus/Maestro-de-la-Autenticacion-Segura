// routes/protectedRoutes.js

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
      success: null,
      username: '',
      authType: ''
    })
  }

  // 2. Detectar tokens JWT desde query params (primera vez después de login)
  const accessToken = req.query.accessToken
  const refreshToken = req.query.refreshToken
  const authType = req.query.authType || (req.cookies.session ? 'cookie' : 'jwt')

  // 3. Si el usuario está autenticado, renderizamos la vista protegida
  res.render('protected', {
    user, // contiene id, username y admin
    message: '¡Bienvenido de vuelta!',
    authType,
    accessToken: accessToken || undefined,
    refreshToken: refreshToken || undefined
  })
})

// Exportamos el router:
export default router