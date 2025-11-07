// user_repository.js

// Importaciones:

import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import { db } from '../model/db.js'
import { SALT_ROUNDS } from '../config.js'


export class Register {
  static async create({ username, password }) {
    // 1. Validaciones:
    Validation.username(username)
    Validation.password(password)

    // 2. Verificar si el usuario ya existe:
    const query = 'SELECT 1 FROM users WHERE username = ? LIMIT 1'
    const existingUser = await new Promise((resolve, reject) => {
      db.get(query, [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // 3. Si ya existe, mandar el mensaje:
    if (existingUser) {
      throw new Error('username already exists');
    }

    // 4. Si llegamos acá, el username es nuevo
    const id = crypto.randomUUID()
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    // 5. Insertar el nuevo usuario
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (id, username, password, admin) VALUES (?, ?, ?, ?)',
        [id, username, hashedPassword, false],
        (err) => {
          if (err) reject(err)
          else resolve()
        }
      )
    })

    return id
  }
}