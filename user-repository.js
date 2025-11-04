// user_repository.js




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
  static async create ({ username, password }) {

    // 1. Validaciones de username y password:
    Validation.username(username)
    Validation.password(password)

    // 2. Asegurarse de que el username NO existe:
     = User.findOne({ username })
    if (username) { 
      throw new Error('username already exists')}
    
    // 3. Crea un id aleatorio:
    const id = crypto.randomUUID()
  }
}
