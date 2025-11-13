// login.js

// Imports:
import db from '../model/db.js'
import bcrypt from 'bcrypt'

// Creamos router:
const router = express.Router()

export class Login {
  static async authenticate({ username, password }) {
    // 1. Verificamos si el usuario existe:
    const query = 'SELECT * FROM users WHERE username = ? LIMIT 1'
    const user = await new Promise((resolve, reject) => {
      db.get(query, [username], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })

    // 2. Si no existe, devolvemos error con su mensaje:
    if (!user) {
      throw new Error('User does not exist')
    }

    // 3. Verificamos la contraseña comparando los hashes:
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      throw new Error('Invalid password')
    }

    // 4. Si llega acá, está autenticado y retornamos:
    return user
  }
}
