// model/db.js

const sqlite3 = require('sqlite3')

const db = new sqlite3.Database('Users', (err) => {
  if (err) {
    console.error('❌ Error al conectar a SQLite:', err.message);
  } else {
    console.log('✅ Conectado a la base de datos SQLite.')}
  
    // Crear tabla si no existe:
    db.serialize(() => {
      // Tabla de temas
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE NOT NULL,
          password TEXT UNIQUE NOT NULL
        )
      `)
    }
  }
)
