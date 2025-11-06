// index.js

// Imports:
import { PORT } from "./config.js"
import express from 'express'
import { UserRepository } from './user-repository.js'

const app = express()


// Middlewares:
// JSON (string que llega en la petición)  --->  Objeto JavaScript (req.body)
app.use(express.json())


// Ruta que le va a mostrar al cliente el menú para registrarse o logearse 
app.get('/', (req, res) => {
  
})


// Ruta que sirve para que el cliente se registre.
app.post('/register', async (req, res) => {
  // Recibe el username y el password que elige el cliente:
  const { username, password } = req.body;

  // Verifica si están los dos elementos necesarios (nombre y contraseña):
  if (!username || !password) {
    return res.status(400).send('Not all the elements necessary to complete the registration are present...');
  }

  try {
    const id = await UserRepository.create({ username, password });
    res.status(201).send({ 
      message: 'User successfully registered!',
      id 
    });
  } catch (error) {
    // Normalmente no es buena idea mandar el error al repositorio
    res.status(400).send(error.message);
  }
})


app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`)
})
