// model/db.js
import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Crear la ruta de la base de datos dentro de la carpeta model
const dbPath = path.join(__dirname, 'Users.db')

// Conexión con la base de datos
// Este archivo creará un archivo 'Users.db' en la carpeta model
const db = new sqlite3.Database(dbPath, (err) => {
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
