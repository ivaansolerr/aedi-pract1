# Iteración 05 - Usuarios y relaciones sociales

## SPEC

### Objetivo

Implementar la búsqueda y consulta de perfiles públicos de usuarios y la gestión de relaciones interpersonales (contactos/amigos y bloqueos de usuarios).

### Requisitos

- Cualquier usuario puede buscar y listar perfiles públicos por nombre o usuario.
- Los perfiles públicos nunca deben exponer contraseñas u otra información sensible.
- Cualquier usuario puede consultar el detalle del perfil público de un usuario.
- Un usuario autenticado puede añadir a otro usuario como contacto (amigo) o bloquearlo.
- Un usuario no puede establecer relaciones de amistad o bloqueo consigo mismo.
- El tipo de relación solo puede ser de amistad o de bloqueo.
- Si ya existe una relación entre dos usuarios, se puede actualizar su estado.
- Un usuario autenticado puede eliminar una relación de amistad o bloqueo existente.
- La gestión de relaciones (añadir, bloquear o eliminar) requiere estar autenticado.
- Responder con error adecuado si el usuario consultado o vinculado no existe.

### Fuera de alcance

- Mensajería privada y chat directo entre usuarios.
- Solicitudes de amistad con confirmación bidireccional.
- Edición de biografía o avatar del propio perfil.

## PLAN

1. Actualizar `backend/schema.sql` para definir la tabla `user_relationships`:
   - `user_relationships (id, user_id, target_user_id, type, created_at)`
   - Claves foráneas referenciando a `users(id)` con `ON DELETE CASCADE`.
   - Restricción de unicidad sobre `(user_id, target_user_id)` para evitar relaciones duplicadas.
2. Actualizar `src/config/db.js` para añadir la limpieza de `user_relationships` dentro de `cleanDb()`.
3. Crear el modelo `src/models/relationshipModel.js` con las operaciones SQL:
   - `setRelationship({ user_id, target_user_id, type })`
   - `findRelationship({ user_id, target_user_id })`
   - `findRelationshipsByUser(user_id)`
   - `deleteRelationship({ user_id, target_user_id })`
   - `sanitizeRelationship(relationship)`
4. Ampliar `src/models/userModel.js` con el método `searchUsers({ query })` para listar perfiles públicos filtrando por coincidencia parcial.
5. Implementar el servicio `src/services/userService.js` con la lógica de negocio y validaciones:
   - Comprobar que `user_id !== target_user_id` (impedir auto-relación).
   - Validar que el tipo de relación sea `'friend'` o `'blocked'`.
   - Comprobar existencia del usuario objetivo antes de asociar la relación.
   - Permitir consultar el perfil público de un usuario y sus relaciones.
   - Eliminar una relación existente.
6. Implementar el controlador `src/controllers/userController.js` para gestionar respuestas HTTP (200, 201, 400, 401, 404).
7. Crear las rutas en `src/routes/userRoutes.js` y montarlas en `src/app.js`:
   - `GET /api/users` (público)
   - `GET /api/users/:id` (público)
   - `POST /api/users/:id/relationships` (protegido)
   - `DELETE /api/users/:id/relationships` (protegido)
8. Diseñar la batería de pruebas en `backend/tests/users.test.js` con casos positivos y negativos para perfiles y relaciones.
9. Ejecutar `npm test` para asegurar que las nuevas pruebas y las 26 anteriores pasan limpiamente.

### Decisiones relevantes

- Se centraliza el acceso a usuarios públicos bajo `/api/users`, separándolo de `/api/auth` (reservado para autenticación y perfil propio autenticado).
- Se implementa un mecanismo de actualización atómica si ya existe una relación previa entre los dos usuarios, evitando errores de duplicidad.
- El perfil público nunca expone el hash de contraseñas u otros datos privados.

### Riesgos y dudas

- Asegurar compatibilidad en la inserción/actualización de relaciones para que funcione idénticamente en PostgreSQL nativo y en el entorno de pruebas en memoria.
- Mantener el orden adecuado de borrado en `cleanDb()` para no infringir claves foráneas.

## TEST_PLAN

### Pruebas automáticas previstas

Se usarán pruebas automáticas con `node:test` y `supertest` para comprobar la gestión de perfiles de usuario y relaciones sociales.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Listar usuarios globalmente | 200 y array de perfiles sin contraseñas | OK (200 y contraseñas omitidas) |
| Buscar usuarios por coincidencia de nombre | 200 y lista filtrada | OK (200 y filtrado correcto) |
| Obtener detalle de perfil de usuario existente | 200 y perfil público | OK (200 y datos públicos) |
| Obtener detalle de perfil de usuario inexistente | 404 y mensaje de usuario no encontrado | OK (404 y mensaje de error) |
| Agregar contacto (amigo) por usuario autenticado | 201 y relación tipo friend | OK (201 y relación creada) |
| Bloquear usuario por usuario autenticado | 201 y relación tipo blocked | OK (201 y bloqueo creado) |
| Actualizar relación existente (de amigo a bloqueado) | 200 o 201 y relación actualizada | OK (200 y tipo actualizado) |
| Intentar auto-relación (amigo o bloqueo de uno mismo) | 400 y mensaje de error | OK (400 y auto-relación rechazada) |
| Establecer relación con usuario objetivo inexistente | 404 y mensaje de usuario no encontrado | OK (404 y usuario no existe) |
| Establecer relación con tipo inválido | 400 y mensaje de error | OK (400 y tipo rechazado) |
| Eliminar relación existente | 200 y relación eliminada | OK (200 y relación eliminada) |
| Gestionar relaciones sin autenticación | 401 y error de autenticación | OK (401 y token requerido) |

### Tests automáticos previstos

- `backend/tests/users.test.js`

## AI_LOG

### Herramienta usada

- Herramienta: Antigravity
- Modelo: Gemini 3.8 Flash
- Tipo: asistente de desarrollo

### Uso realizado

Se usó la IA para:

- estructurar la especificación (SPEC) y plan (PLAN) de la iteración de usuarios y relaciones conforme a los requerimientos de la asignatura;
- definir los endpoints y validaciones para la red de contactos y bloqueos;
- diseñar e implementar la tabla `user_relationships` con claves foráneas e integridad en `schema.sql`;
- implementar la capa de modelos (`relationshipModel.js` y extensión de `userModel.js`);
- implementar la lógica de negocio en `userService.js` (validación de auto-relación, estados de amistad/bloqueo y borrado);
- crear el controlador `userController.js` y las rutas en `userRoutes.js` montadas en `app.js`;
- diseñar e implementar la batería de 12 pruebas automáticas en `users.test.js`.

### Prompts importantes

- “ve con el documento de la iteración 5, lo tinees creado”
- “para las relaciones de amistad/bloqueo se sigue en postgres? supabase solo se implementa para el chat?”
- “vale, adelante, completa la iteración”

### Resultado

La IA implementó el soporte completo de perfiles de usuario y gestión de relaciones sociales (amigos y bloqueos) en PostgreSQL a través de la API REST, logrando que los 38 tests automáticos del proyecto pasasen satisfactoriamente sin ningún fallo.

### Decisión del estudiante

- Se acordó gestionar las relaciones interpersonales directamente en la base de datos PostgreSQL a través de la API REST, manteniendo Supabase Realtime reservado para la funcionalidad de mensajería instantánea y notificaciones.
- Se aprobó la lógica de actualización automática de relaciones (cambiar entre amigo y bloqueado sin duplicados).

### Correcciones manuales

- Se renombró el documento de la iteración a `05-amigosYbloqueo.md` para reflejar con precisión su contenido.

## COMMITS RELACIONADOS

- Pendiente de creación durante el desarrollo de la iteración.

