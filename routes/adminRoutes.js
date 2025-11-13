// routes/adminRoutes.js

// Imports:
import express from 'express'
import db from '../model/db.js'

// Creamos router:
const router = express.Router()


// Middleware para verificar que el usuario sea admin:
const isAdmin = (req, res, next) => {
  const { user } = req.session
  
  // Si no hay usuario o no es admin, denegar acceso
  if (!user || !user.admin) {
    return res.status(403).render('error', {
      message: '❌ Acceso denegado',
      detail: 'Solo los administradores pueden acceder a esta página.'
    })
  }
  
  next()
}


// Ruta principal del panel de admin (ver todos los usuarios):
router.get('/', isAdmin, async (req, res) => {
  try {
    // Obtener todos los usuarios de la base de datos
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT id, username, admin FROM users', [], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })

    res.render('admin-panel', {
      admin: req.session.user,
      users,
      message: null,
      error: null
    })

  } catch (error) {
    res.status(500).render('error', {
      message: '❌ Error al cargar usuarios',
      detail: error.message
    })
  }
})


// Ruta para borrar un usuario:
router.post('/delete/:id', isAdmin, async (req, res) => {
  const { id } = req.params
  
  // No permitir que el admin se borre a sí mismo
  if (id === req.session.user.id) {
    return res.redirect('/admin?error=No podés eliminarte a vos mismo')
  }

  try {
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    res.redirect('/admin?message=Usuario eliminado correctamente')

  } catch (error) {
    res.redirect('/admin?error=' + encodeURIComponent(error.message))
  }
})


// Ruta para hacer admin a un usuario:
router.post('/make-admin/:id', isAdmin, async (req, res) => {
  const { id } = req.params

  try {
    await new Promise((resolve, reject) => {
      db.run('UPDATE users SET admin = true WHERE id = ?', [id], (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    res.redirect('/admin?message=Usuario promovido a admin correctamente')

  } catch (error) {
    res.redirect('/admin?error=' + encodeURIComponent(error.message))
  }
})

// Exportamos el router:
export default router