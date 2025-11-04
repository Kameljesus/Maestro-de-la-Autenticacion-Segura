import crypto from "node:crypto"
import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from "./config.js"

const { Schema } = new dbLocal({path: './db'})

const User = Schema('User', {
  _id: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
})

export class UserRepository {
  static async create ({ username, password }) {

    // 1. Validaciones de username (opcional: usar zod):
    Validation.username(username)
    Validation.password(password)

    
    // 2. Asegurarse de que el username NO existe:
    const user = User.findOne({ username })
    if (user) { 
      throw new Error('username already exists')}

    // Crea un id aleatorio:
    const id = crypto.randomUUID()

    // Hasheamos la contraseña:
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS) // hashSync --> bloquea el thread principal.


    User.create({
      _id: id,
      username,
      password: hashedPassword
    }).save()

    return id
    }


  static async login ({ username, password }) {

    // 1. Validaciones de username (opcional: usar zod):
    Validation.username(username)
    Validation.password(password)

    // 2. Asegurarse de que el username SI existe:
    const user = User.findOne({ username })
    if (!user) { 
      throw new Error('username does not exist')}

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new Error('password is invalid')}
    
    const { password: _, ... publicUser } = user

    return publicUser
  }
}


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