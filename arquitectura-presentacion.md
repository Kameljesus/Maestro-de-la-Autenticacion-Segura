## 1. INTRODUCCIÓN:

# ¿Qué es este proyecto?:

- Sistema completo de autenticación y autorización
- Permite a usuarios registrarse, iniciar sesión y acceder a áreas protegidas
- Implementa 2 métodos de autenticación: Cookie (con estado) y JWT (sin estado)
- Control de acceso basado en roles: Usuario normal y Administrador

# Tecnologías principales:

Backend: Node.js + Express
Base de datos: SQLite
Vistas: EJS
Seguridad: bcrypt (hashing), jsonwebtoken (JWT)


## 2. ARQUITECTURA DEL PROYECTO:

proyecto/
│
├── model/              → Base de datos
│   └── db.js           → Conexión SQLite + Tabla users
│
├── controllers/             → Lógica de negocio
│   ├── register.js          → Crear usuarios
│   ├── login.js             → Autenticar usuarios
│   └── validation.js        → Validar datos
│
├── middlewares/             → Interceptores
│   └── auth-middleware.js   → Verifica JWT o Cookie
│
├── routes/                  → Endpoints de la API
│   ├── registerRoutes.js
│   ├── loginRoutes.js
│   ├── protectedRoutes.js
│   ├── userRoutes.js   (requiere JWT)
│   ├── adminRoutes.js  (requiere ser admin)
│   ├── logoutRoutes.js
│   └── tokenRoutes.js
│
├── views/              → Interfaz de usuario (EJS)
│   ├── index.ejs
│   ├── register.ejs
│   ├── login.ejs
│   ├── protected.ejs
│   ├── user-view.ejs
│   ├── admin-panel.ejs
│   └── error.ejs
│
├── config.js           → Configuración (puerto, claves)
├── index.js            → Punto de entrada
└── make-admin.js       → Script para hacer admin a usuarios


## 3. FLUJO DE AUTENTICACIÓN:

# A) REGISTRO DE USUARIO:
Cliente → /register → Controller
                         ↓
                    1. Validar datos (min 3 chars username, min 6 chars password)
                    2. Verificar que username no exista
                    3. Hashear password con bcrypt
                    4. Guardar en BD (SQLite)
                         ↓
                    Redirigir a /login

# Código clave:
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
db.run('INSERT INTO users (id, username, password, admin) VALUES (?, ?, ?, ?)')
```

---

### **B) LOGIN: 2 OPCIONES**

#### **Opción 1: Cookie (Con Estado - Persistente)**
```
Cliente → Elige "Cookie" → /login
                              ↓
                         1. Verificar username existe
                         2. Comparar password con bcrypt
                         3. Crear COOKIE con el ID del usuario
                              ↓
                         Guardar cookie en navegador
                              ↓
                         En cada request → Cookie se envía automáticamente
                              ↓
                         authMiddleware lee la cookie → Busca usuario en BD
Ventajas:

✅ Persiste automáticamente (si volvés a localhost:3000/protected, seguís logueado)
✅ El navegador maneja todo

# Código clave:

res.cookie('session', user.id, {
  httpOnly: true,  // Solo el servidor puede leer
  secure: true,    // Solo en HTTPS
  sameSite: 'strict',
  maxAge: 1000 * 60 * 60  // 1 hora
})
```

---

#### **Opción 2: JWT (Sin Estado - Stateless)**
```
Cliente → Elige "JWT" → /login
                           ↓
                      1. Verificar credenciales
                      2. Generar 2 tokens:
                         - accessToken (1h) → Para autenticar
                         - refreshToken (7d) → Para renovar
                           ↓
                      Enviar tokens al cliente
                           ↓
                      Cliente guarda en localStorage
                           ↓
                      En cada request → Cliente envía token en header:
                      Authorization: Bearer <token>
                           ↓
                      authMiddleware verifica token con SECRET_KEY
Ventajas:

✅ Sin estado en el servidor (escalable)
✅ Toda la info del usuario está en el token
❌ NO persiste automáticamente (si refrescás, tenés que enviar el token de nuevo con JavaScript)

# Código clave:

const accessToken = jwt.sign(
  { id: user.id, username: user.username, admin: user.admin },
  SECRET_JWT_KEY,
  { expiresIn: '1h' }
)

// En el cliente:
localStorage.setItem('accessToken', token)


## 4. MIDDLEWARE DE AUTENTICACIÓN:

# ¿Qué hace?:

- Se ejecuta ANTES de cada ruta
- Verifica si el usuario está autenticado
- Guarda el usuario en req.session.user

// authMiddleware.js

1. ¿Hay token JWT en el header Authorization?
   → SÍ: Verificar con jwt.verify() → Guardar usuario
   → NO: Seguir

2. ¿Hay cookie de sesión?
   → SÍ: Buscar usuario en BD por ID → Guardar usuario
   → NO: Usuario = null

3. Continuar a la ruta

# Analogía:
Es como un guardia de seguridad que está en la entrada. Primero revisa si tenés un pase VIP (JWT), si no, revisa si tenés una pulsera de hotel (Cookie). Si no tenés ninguno, te deja pasar igual pero sin privilegios.


## 5. CONTROL DE ACCESO BASADO EN ROLES:

Tipos de usuarios:

Rol: Usuario Normal. 
Permisos: Acceder a /protected, ver su vista personal (/user con JWT).

Rol: Administrador.
Permisos: Todo lo anterior + acceder a /admin (ver, borrar usuarios, hacer admin a otros).

# ¿Cómo funciona?:

// En la base de datos:
users (
  id,
  username,
  password,
  admin: BOOLEAN  ← Este campo define el rol
)

// En el middleware isAdmin:
if (!user || !user.admin) {
  return res.status(403).render('error', {
    message: 'Solo administradores'
  })
}
```

---

## 🎨 6. PÁGINAS PRINCIPALES (2 min)

### **Flujo del usuario:**
```
1. localhost:3000/
   ↓
2. /register → Crear cuenta
   ↓
3. /login → Elegir Cookie o JWT
   ↓
4. /protected → Página principal con 3 botones:
   
   🚪 Cerrar sesión
   
   👤 Ver vista de usuario (SOLO JWT)
      → Requiere enviar token en header
      → Muestra "Hola [usuario], esta es tu página"
   
   👑 Panel de Admin (SOLO si eres admin)
      → Ver lista de usuarios
      → Borrar usuarios
      → Hacer admin a otros


## 7. MEDIDAS DE SEGURIDAD:

# A) Hashing de Contraseñas:

// NO guardamos en texto plano:
password: "123456" ❌

// Guardamos el hash:
password: "$2b$10$kQvX..." ✅

// Verificación:
bcrypt.compare(passwordIngresada, hashGuardado)

# Analogía: 
Es como picar carne. Una vez picada, no podés volver a formar la carne original. Solo podés picar carne nueva y compararla.

# B) Configuración de Cookies Seguras:
{
  httpOnly: true,     // JavaScript del navegador NO puede leer
  secure: true,       // Solo en HTTPS
  sameSite: 'strict'  // Protección contra CSRF
}

# C) Tokens JWT con Expiración
{ expiresIn: '1h' }  // El token se invalida después de 1 hora

# D) Validación de Datos:

// validation.js
- Username: mínimo 3 caracteres
- Password: mínimo 6 caracteres
- Verificar que username no exista antes de registrar
```

---

## ⚡ 8. DIFERENCIAS CLAVE: Cookie vs JWT (2 min)

|       Aspecto          |              Cookie                     |                     JWT                    |
|---------|--------|-----|
| **Persistencia**       | ✅ Automática                           | ❌ Manual (localStorage) |
| **Envío**              | ✅ Automático en cada request           | ❌ Manual (header Authorization) |
| **Estado en servidor** | ✅ Guarda sesión                        | ❌ Stateless |
| **Escalabilidad**      | ⚠️ Limitada                             | ✅ Escalable |
| **Prueba**             | Refrescar `/protected` → Sigue logueado | Botón "Ver Vista Usuario" → Verifica token |

**¿Cuándo usar cada uno?**
- **Cookie:** Aplicaciones tradicionales, usuarios que cierran y abren el navegador
- **JWT:** APIs, microservicios, aplicaciones móviles, alta escalabilidad

---

## 🎯 9. DEMOSTRACIÓN EN VIVO (5 min)

### **Secuencia recomendada:**

1. **Registro**
```
   - Ir a /register
   - Crear usuario: "demo"
   - Mostrar que la contraseña se hashea en la BD
```

2. **Login con Cookie**
```
   - Login → Elegir "Cookie"
   - Mostrar /protected
   - Cerrar pestaña
   - Abrir de nuevo localhost:3000/protected
   - ✅ SIGUE LOGUEADO (cookie persiste)
```

3. **Login con JWT**
```
   - Login → Elegir "JWT"
   - Abrir DevTools → Application → LocalStorage
   - Mostrar accessToken y refreshToken
   - Click en "Ver Vista de Usuario"
   - ✅ Funciona porque envía el token
   - Refrescar la página
   - ❌ Pide login (JWT no persiste automáticamente)
```

4. **Panel de Admin**
```
   - Ejecutar: node make-admin.js
   - Login como admin
   - Ir a /admin
   - Mostrar lista de usuarios
   - Hacer admin a otro usuario
   - Borrar un usuario