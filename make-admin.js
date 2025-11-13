// make-admin.js

// Imports:
import db from './model/db.js'

// Función para hacer admin a un usuario:
function makeAdmin(username) {
  return new Promise((resolve, reject) => {
    // Primero verificamos si el usuario existe:
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
      if (err) {
        reject(err)
        return
      }

      // Si no existe el usuario:
      if (!user) {
        reject(new Error(`❌ El usuario "${username}" no existe en la base de datos`))
        return
      }

      // Si ya es admin:
      if (user.admin) {
        console.log(`✅ El usuario "${username}" ya es administrador`)
        resolve()
        return
      }

      // Hacemos admin al usuario:
      db.run('UPDATE users SET admin = true WHERE username = ?', [username], (err) => {
        if (err) {
          reject(err)
        } else {
          console.log(`✅ Usuario "${username}" promovido a administrador correctamente`)
          resolve()
        }
      })
    })
  })
}

// Ejecutar el script:
makeAdmin('Kamel')
  .then(() => {
    console.log('🎉 Operación completada con éxito')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error.message)
    process.exit(1)
  })