// model/db.js
import sqlite3 from 'sqlite3'

// Conexión con la base de datos
// Este archivo creará un archivo 'Users.db' en la carpeta del proyecto
const db = new sqlite3.Database('Users.db', (err) => {
  if (err) {
    console.error('❌ Error al conectar a SQLite:', err.message)
  } else {
    console.log('✅ Conectado a la base de datos SQLite.')
  }
})

// Crear la tabla 'users' si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      admin BOOLEAN DEFAULT false
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error al crear la tabla users:', err.message)
    } else {
      console.log('✅ Tabla users lista')
    }
  })
})

// Exportamos la base de datos para usarla en otros archivos
export default db
