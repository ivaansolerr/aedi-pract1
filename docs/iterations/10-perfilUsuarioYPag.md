# Iteración 10 - Paginación y perfil de usuario

## SPEC

### Objetivo

Permitir a los usuarios editar su propio perfil público (biografía, avatar y nombre) e incorporar paginación configurable en los listados principales de la plataforma (obras, debates y usuarios) para optimizar el rendimiento y la navegación.

### Requisitos

- Un usuario autenticado puede actualizar los datos de su propio perfil, incluyendo nombre de usuario, biografía y avatar.
- No se permite actualizar el perfil dejando el nombre de usuario vacío.
- Si el nuevo nombre de usuario ya está en uso por otro miembro, se debe rechazar la modificación e informar del conflicto.
- Un usuario no puede modificar el perfil de otros usuarios.
- Los visitantes y miembros pueden solicitar listados de obras, debates y usuarios especificando la página y el límite de elementos deseados.
- Si no se indican parámetros de paginación, el sistema devuelve los resultados con valores predeterminados seguros.
- Las respuestas paginadas deben incluir metadatos de navegación que indiquen el total de elementos, página actual, límite por página y número total de páginas.
- La modificación del perfil de usuario requiere autenticación activa.

### Fuera de alcance

- Modificación de contraseña o correo electrónico en este endpoint.
- Subida de archivos binarios para el avatar (se gestiona mediante URL o enlace de imagen).
- Paginación mediante cursores opacos.

---

## PLAN

1. Actualizar `src/models/userModel.js`:
   - Añadir `findUserByUsername(username)` para comprobar colisiones de nombre.
   - Añadir `updateUserProfile({ id, username, bio, avatar_url })` para persistir los cambios de perfil.
   - Modificar `searchUsers({ query, page, limit })` para realizar conteo total (`COUNT(*)`) y paginación con `LIMIT` y `OFFSET`.
2. Actualizar `src/models/workModel.js`:
   - Modificar `findAllWorks({ title, type, genre, release_year, page, limit })` para calcular el total de obras y aplicar `LIMIT` y `OFFSET`.
3. Actualizar `src/models/debateModel.js`:
   - Modificar `findAllDebates({ workId, page, limit })` para calcular el total de debates y aplicar `LIMIT` y `OFFSET`.
4. Extender `src/services/authService.js` y `src/services/userService.js`:
   - Implementar `updateProfile({ userId, username, bio, avatar_url })`: validar obligatoriedad del nombre (400), unicidad del nombre entre usuarios distintos (409) y existencia del usuario (404).
   - Adaptar `listWorks`, `listDebates` y `getUsersList` para calcular los metadatos de paginación (`total`, `page`, `limit`, `totalPages`).
5. Extender controladores y rutas:
   - En `authController.js` y `authRoutes.js`: añadir `updateMe` para atender `PUT /api/auth/me` con `authMiddleware`.
   - En `userController.js` y `userRoutes.js`: añadir `updateProfileHandler` para atender `PUT /api/users/me` y `PUT /api/users/:id` con verificación de autoría (403 para perfiles ajenos), y pasar parámetros `page` y `limit` en `getAllUsers`.
   - En `workController.js` y `debateController.js`: recibir `page` y `limit` de la query y responder con `{ works, pagination }` y `{ debates, pagination }`.
6. Diseñar e implementar pruebas automáticas con `node:test` y `supertest`:
   - Modificación exitosa del perfil propio (`username`, `bio`, `avatar_url`).
   - Rechazo de modificación de perfil con nombre vacío (400).
   - Rechazo de modificación si el nombre de usuario ya está ocupado (409).
   - Rechazo de modificación de perfil ajeno (403).
   - Rechazo de modificación de perfil sin autenticación (401).
   - Paginación en catálogo de obras (`?page=1&limit=2`, `?page=2&limit=2`) con verificación de items y metadatos.
   - Paginación en listado de debates (`?page=1&limit=1`) con verificación de items y metadatos.
   - Paginación en listado de usuarios (`?page=1&limit=1`) con verificación de items y metadatos.
7. Ejecutar suite de pruebas (`npm test`) y verificar que todos los casos pasan satisfactoriamente.

### Decisiones relevantes

- Para el perfil de usuario se habilita `PUT /api/auth/me` y `PUT /api/users/:id` (con alias `PUT /api/users/me`), garantizando que un usuario solo pueda editar sus propios datos y respondiendo con HTTP 403 ante intentos de manipulación de cuentas de terceros.
- Las respuestas de listados conservan intacta la estructura original de arrays (`works`, `debates`, `users`) y añaden el objeto `pagination` para máxima compatibilidad con clientes existentes y tests anteriores.

### Riesgos y dudas

- Asegurar que la paginación con `LIMIT` y `OFFSET` sea completamente compatible tanto con el PostgreSQL real como con el motor en memoria `pg-mem` utilizado en los tests automatizados.

---

## TEST_PLAN

### Pruebas automáticas previstas

Se usarán pruebas automáticas con `node:test` y `supertest` para validar la edición de perfil y la paginación.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Actualizar perfil propio con datos válidos | 200 y perfil actualizado | OK (200 y perfil actualizado) |
| Rechazar actualización de perfil con nombre vacío | 400 y mensaje de error | OK (400 y nombre de usuario obligatorio) |
| Rechazar actualización con nombre de usuario duplicado | 409 y mensaje de conflicto | OK (409 y conflicto por nombre duplicado) |
| Rechazar actualización de perfil ajeno | 403 y mensaje de acceso denegado | OK (403 y falta de permisos) |
| Rechazar actualización de perfil sin autenticación | 401 y token requerido | OK (401 y autenticación requerida) |
| Paginar listado de obras con página y límite | 200 con obras paginadas y metadatos de paginación | OK (200 y obras paginadas con metadatos) |
| Paginar listado de debates con página y límite | 200 con debates paginados y metadatos de paginación | OK (200 y debates paginados con metadatos) |
| Paginar listado de usuarios con página y límite | 200 con usuarios paginados y metadatos de paginación | OK (200 y usuarios paginados con metadatos) |

### Tests automáticos previstos

- `backend/tests/users.test.js`
- `backend/tests/works.test.js`
- `backend/tests/debates.test.js`

---

## AI_LOG

### Herramienta usada

- Herramienta: Antigravity
- Modelo: Gemini 3.8 Flash
- Tipo: asistente de desarrollo

### Uso realizado

Se usó la IA para:

- estructurar la especificación (SPEC) y plan (PLAN) de la iteración 10 de perfil de usuario y paginación;
- definir los endpoints de actualización de perfil propio (`PUT /api/auth/me`, `PUT /api/users/me`, `PUT /api/users/:id`) con verificación estricta de autoría (HTTP 403);
- planificar e implementar las consultas SQL con `COUNT(*)`, `LIMIT` y `OFFSET` compatibles con PostgreSQL y `pg-mem`;
- extender modelos, servicios y controladores para retornar metadatos de paginación (`total`, `page`, `limit`, `totalPages`);
- diseñar e implementar la batería de pruebas automáticas en `users.test.js`, `works.test.js` y `debates.test.js`;
- ejecutar la batería completa de pruebas y verificar el 100% de éxito (90 tests pasando).

### Prompts importantes

- “tienes ya el documento de la decima iteración, adelante, completalo”

### Resultado

Implementación completa y validada de la edición de perfil de usuario y la paginación con metadatos en obras, debates y usuarios. La suite completa del backend alcanza 90 pruebas automáticas superadas con un 100% de éxito y 0 fallos.

### Decisión del estudiante

- Se acordó implementar la edición de perfil sobre `PUT /api/auth/me` con soporte en `PUT /api/users/me` y `PUT /api/users/:id` (con restricción HTTP 403 para perfiles ajenos).
- Se decidió estructurar la paginación incluyendo un objeto `pagination` junto al array de resultados correspondiente para garantizar la compatibilidad con endpoints y tests previos.

### Correcciones manuales

- Definición del helper de creación de obras en tests para las comprobaciones de paginación del catálogo.

---

## COMMITS RELACIONADOS

- "959a4cec9daad637d7ac21867597eef1c11752b5"
