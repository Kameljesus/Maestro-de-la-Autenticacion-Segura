// user_repository.js

// Importaciones:

import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import db from './model/db.js'
import { SALT_ROUNDS } from './config.js'

class Validation {
  static username (username) {
    if (typeof username !== 'string') {
      throw new Error('username must be a string')}
    if (username.length < 3) {
      throw new Error('username must be at least 3 characters long')}
  }

  static password (password) {
    if (typeof password !== 'string') {
      throw new Error('password must be a string')}
    if (password.length < 6) { 
      throw new Error('password must be at least 6 characters long')}
  }
}


export class UserRepository {
  static async create({ username, password }) {
    // 1. Validaciones
    Validation.username(username)
    Validation.password(password)

    // 2. Obtener todos los usernames de la base
    const query = 'SELECT username FROM users'
    const users = await new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })

    // 3. Recorrer con for para buscar coincidencias
    for (const user of users) {
      if (user.username === username) {
        throw new Error('username already exists')
      }
    }

    // 4. Si llegamos acá, el username es nuevo
    const id = crypto.randomUUID()
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    // 5. Insertar el nuevo usuario
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
        [id, username, hashedPassword],
        (err) => {
          if (err) reject(err)
          else resolve()
        }
      )
    })

    return id
  }
}
