# Iteración 01 - Autenticación de usuarios

## SPEC

### Objetivo

Implementar la autenticación básica de usuarios para permitir registrar cuentas y acceder a la API con un token JWT.

### Requisitos

- Un usuario puede registrarse con nombre, email y contraseña.
- El email debe ser único en la aplicación.
- La contraseña se debe almacenar de forma segura usando hash.
- Un usuario puede iniciar sesión con email y contraseña válidos.
- La API debe devolver un token JWT en caso de login correcto.
- Las rutas protegidas deben requerir un token válido.
- Si las credenciales no son válidas, la API debe responder con un error claro.

### Fuera de alcance

- Recuperación de contraseña.
- Login con redes sociales.
- Roles de usuario.
- Persistencia en base de datos real.
- Validación avanzada de fortaleza de contraseña.

## PLAN

1. Crear la estructura base del backend con Express.
2. Definir un almacenamiento en memoria para usuarios.
3. Implementar el servicio de autenticación con registro y login.
4. Añadir hash de contraseñas con `bcryptjs`.
5. Generar JWT al iniciar sesión.
6. Crear middleware para validar tokens en rutas protegidas.
7. Definir rutas `/api/auth/register`, `/api/auth/login` y `/api/auth/me`.
8. Ejecutar pruebas de API para verificar los casos principales.

### Decisiones relevantes

- Se usa almacenamiento en memoria para simplificar la primera iteración y poder probar la lógica de autenticación sin depender de una base de datos.
- Se protege la ruta `/api/auth/me` con middleware de autenticación para comprobar la validación del token.
- Se acepta una validación mínima de campos y un email único como requisito funcional principal.

### Riesgos y dudas

- La persistencia de usuarios no será real hasta futuras iteraciones.
- El secreto del JWT está definido por entorno; en producción se debe configurar de forma segura.

## TEST_PLAN

### Pruebas manuales y automáticas

Se usarán pruebas automáticas con `node:test` y `supertest` para verificar los casos principales.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Registro con datos válidos | 201 y usuario creado | |
| Registro con email duplicado | 409 y mensaje de conflicto | |
| Login con credenciales válidas | 200 y token devuelto | |
| Login con contraseña incorrecta | 401 y error de credenciales | |
| Acceso a perfil sin token | 401 y error de autenticación | |

### Tests automáticos previstos

- `backend/tests/auth.test.js`

## AI_LOG

### Herramienta usada

- Herramienta: GitHub Copilot
- Modelo: MAI-Code-1.1-Flash
- Tipo: asistente de desarrollo

### Uso realizado

Se usó la IA para:

- proponer la estructura inicial del backend;
- definir la primera iteración en términos de SPEC y PLAN;
- revisar la implementación de autenticación y pruebas;
- sugerir validaciones básicas de error.

### Prompts importantes

- “Diseña una primera iteración de backend para autenticación de usuarios con Express y JWT. Mantén el alcance limitado y documenta la SPEC y PLAN.”
- “Genera pruebas de API para registro y login con casos positivos y negativos.”

### Resultado

La IA aportó una estructura clara y una base útil para la API, pero se revisó manualmente el alcance para que no se añadieran funciones fuera de la iteración.

### Decisión del estudiante

Se aceptó la idea de usar Express, JWT y una capa de middleware de autenticación.
Se rechazó añadir persistencia real en base de datos o recuperación de contraseña porque quedan fuera del alcance de esta iteración.

### Correcciones manuales

- La implementación final usa almacenamiento en memoria para no bloquear el desarrollo inicial.
- Se cambió el enfoque de “base de datos real” a una estructura ligera de prueba para cumplir la iteración de forma concreta y verificable.

## COMMITS RELACIONADOS

- Pendiente de creación durante el desarrollo de la iteración.
