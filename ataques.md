## Protección contra XSS y CSRF:

# ¿Qué es XSS (Cross-Site Scripting)?:

XSS es un ataque donde un hacker mete JavaScript malicioso en tu página.
Ejemplo típico: el atacante logra que tu navegador ejecute algo como:

document.cookie

Con eso podría robarte cookies sensibles (tokens, sesión, etc).

# ¿Cómo se evita?:

Una de las defensas más importantes es que las cookies sensibles tengan:

- httpOnly: true → JavaScript NO puede leerlas → evita que document.cookie las robe.

Aunque haya XSS, el atacante no puede robar la cookie.


## ¿Qué es CSRF (Cross-Site Request Forgery)?:

Ataque donde un sitio externo intenta que tu navegador haga una acción sin tu permiso usando tus cookies.

# Ejemplo:
Estás logueado en tu banco → visitas una página maliciosa → esa página manda un POST oculto a tu banco para transferir dinero.
Tu navegador envía automáticamente las cookies, por eso funciona.

# ¿Cómo se evita?

Una defensa crucial es:

- sameSite: 'strict' → Tu navegador NO envía cookies si la petición viene desde otro sitio. Bloquea casi todos los CSRF.


## Explicación de las tres líneas críticas:

{
  httpOnly: true,     
  secure: true,       
  sameSite: 'strict'
}

1. httpOnly: true

Evita que JavaScript del navegador lea la cookie.

Previene robo de cookies incluso si existen vulnerabilidades XSS.

Protege contra:
✔ Robo de sesión por XSS.

2. secure: true

La cookie solo viaja por HTTPS, nunca por HTTP.

Evita que alguien la capture en redes públicas (WiFi de cafetería, etc).

Protege contra:
✔ Interceptación de cookies (Man-in-the-middle).

3. sameSite: 'strict'

La cookie solo se envía si la navegación viene del mismo sitio.

Un sitio externo NO puede forzar peticiones que incluyan tu cookie.

Protege contra:
✔ CSRF.

Resumen final

Configuración: httpOnly
Qué evita: XSS (robo de cookies)
Por qué funciona: JS del navegador no puede leer la cookie

Configuración: secure
Qué evita: Robo de cookies en redes inseguras
Por qué funciona: Solo viaja por HTTPS

Configuración: sameSite: strict
Qué evita: CSRF
Por qué funciona: El navegador no envía cookies si vienes de otro sitio