// registerRoutes.js

// Imports:
import express from 'express'
import { Register } from './controllers/register.js'

// Creamos router:
const router = express.Router()


// Ruta para mostrar la página de registro:
router.get('/', (req, res) => {
  res.render('register')
})


// Ruta que sirve para que el cliente se registre.
router.post('/', async (req, res) => {
  // 1. Recibe el username y el password que elige el cliente:
  const { username, password } = req.body

  // 2. Verifica si están los dos elementos necesarios (nombre y contraseña):
  if (!username || !password) {

    // Renderizamos la misma vista de registro con un mensaje de error
    return res.render('register', { 
      error: 'Todos los campos son obligatorios', 
      username: '', 
      password: '' 
    })
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