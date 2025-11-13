// routes/tokenRoutes.js

// Imports:
import express from 'express'
import jwt from 'jsonwebtoken'
import { SECRET_JWT_KEY } from "../config.js"

// Creamos router:
const router = express.Router()


// Ruta para refrescar el token:
router.post('/', (req, res) => {
  // 1. Obtener refresh token del body o cookie
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).send('Missing refresh token');
  }

  try {
    // 2. Verificar que el refresh token sea válido
    const decoded = jwt.verify(refreshToken, SECRET_JWT_KEY);

    // 3. Generar un nuevo access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, username: decoded.username, admin: decoded.admin },
      SECRET_JWT_KEY,
      { expiresIn: '1h' } // misma duración que antes
    );

    // 4. Devolver el token al cliente
    return res.send({
      message: 'Access token refreshed',
      accessToken: newAccessToken
    });

  } catch (error) {
    return res.status(401).send('Invalid or expired refresh token');
  }
})

// Exportamos el router:
export default router