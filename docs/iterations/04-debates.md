# Iteración 04 - Debates y comentarios

## SPEC

### Objetivo

Permitir abrir debates sobre obras ficticias y que los usuarios participen con comentarios.

### Requisitos

- Diseñar y crear las tablas `debates` y `debate_comments` con claves foráneas hacia `works` y `users`.
- Permitir a un usuario autenticado crear un debate asociado a una obra existente (`POST /api/works/:workId/debates`).
- Validar que la obra exista antes de crear el debate; responder con 404 si no existe.
- Validar que los campos obligatorios del debate (título y descripción) no estén vacíos; responder con 400 en caso contrario.
- Permitir la consulta pública de la lista de debates (`GET /api/debates`), con posibilidad de filtrar por obra (`?work_id=...`).
- Permitir la consulta pública del detalle de un debate (`GET /api/debates/:id`), incluyendo su información básica, datos del autor y la lista de comentarios asociados ordenados cronológicamente.
- Responder con 404 al consultar un debate que no existe.
- Permitir a un usuario autenticado publicar un comentario en un debate existente (`POST /api/debates/:id/comments`).
- Validar que el comentario contenga texto no vacío; responder con 400 si está vacío.
- Validar que el debate exista antes de insertar el comentario; responder con 404 si no existe.
- Proteger con middleware de autenticación (`authMiddleware`) las rutas de creación de debates y comentarios (responder con 401 si no hay token válido).
- Mantener las rutas de consulta abiertas para usuarios no autenticados (visitantes).

### Fuera de alcance

- Edición y eliminación de debates y comentarios (inmutables en esta iteración).
- Paginación avanzada de debates o comentarios.
- Anidación de comentarios (respuestas en árbol o comentarios a otros comentarios).
- Sistema de suscripción y notificaciones de nuevos comentarios (se abordará en la iteración correspondiente).
- Sistema de likes, votos o valoraciones en comentarios.

## PLAN

1. Actualizar `backend/schema.sql` para definir las tablas `debates` y `debate_comments` con claves foráneas e integridad referencial:
   - `debates (id, work_id, user_id, title, description, created_at)`
   - `debate_comments (id, debate_id, user_id, content, created_at)`
2. Actualizar `src/config/db.js` para registrar el esquema en memoria (`pg-mem`) y ajustar la función de limpieza `cleanDb()` para vaciar las nuevas tablas en el orden correcto de dependencias.
3. Crear el modelo `src/models/debateModel.js`:
   - `createDebate({ work_id, user_id, title, description })`
   - `findAllDebates({ workId })`
   - `findDebateById(id)`
   - `sanitizeDebate(debate)`
4. Crear el modelo `src/models/commentModel.js`:
   - `createComment({ debate_id, user_id, content })`
   - `findCommentsByDebateId(debateId)`
   - `sanitizeComment(comment)`
5. Implementar el servicio `src/services/debateService.js` con la lógica de negocio y validaciones:
   - Comprobar existencia previa de la obra antes de crear debate.
   - Validar campos obligatorios.
   - Obtener detalle del debate junto a sus comentarios asociados.
   - Comprobar existencia del debate antes de añadir comentario.
6. Implementar el controlador `src/controllers/debateController.js` para gestionar las peticiones HTTP y devolver respuestas consistentes.
7. Crear las rutas en `src/routes/debateRoutes.js` y actualizar `src/app.js`:
   - `POST /api/works/:workId/debates` (protegido)
   - `GET /api/debates` (público)
   - `GET /api/debates/:id` (público)
   - `POST /api/debates/:id/comments` (protegido)
8. Diseñar la batería de pruebas en `backend/tests/debates.test.js` con casos positivos y negativos para debates y comentarios.
9. Ejecutar `npm test` para asegurar que las nuevas pruebas y las 14 anteriores superan la ejecución.

### Decisiones relevantes

- La consulta de detalle de debate (`GET /api/debates/:id`) devolverá los comentarios asociados dentro del mismo payload para simplificar el consumo desde el cliente y evitar múltiples peticiones.
- Las consultas son públicas para permitir la exploración en modo lectura a visitantes (según `PROJECT_SPEC.md`), mientras que las creaciones exigen autenticación JWT vía `authMiddleware`.
- La integridad referencial se garantiza a nivel de base de datos con claves foráneas `FOREIGN KEY` referenciando a `works` y `users`.

### Riesgos y dudas

- Asegurar que la función `cleanDb()` borre primero `debate_comments`, luego `debates`, y finalmente `works` y `users` para evitar violaciones de clave foránea.
- En `pg-mem`, asegurar que las claves foráneas y joins se resuelvan de forma equivalente a PostgreSQL real.

## TEST_PLAN

### Pruebas automáticas previstas

Se usarán pruebas automáticas con `node:test` y `supertest` para comprobar la gestión integral de debates y comentarios.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Crear debate con datos válidos por usuario autenticado | 201 y debate creado con IDs | OK (201 y IDs asignados) |
| Crear debate sin autenticación | 401 y error de autenticación | OK (401 y token requerido) |
| Crear debate en obra inexistente | 404 y mensaje de obra no encontrada | OK (404 y mensaje de error) |
| Crear debate con campos obligatorios vacíos | 400 y mensaje de error | OK (400 y mensaje de error) |
| Listar debates globalmente | 200 y array de debates | OK (200 y array de debates) |
| Listar debates filtrando por obra existente | 200 y debates correspondientes a la obra | OK (200 y filtrado correcto) |
| Obtener detalle de debate existente con sus comentarios | 200 con datos del debate y lista de comentarios | OK (200 y array de comentarios) |
| Obtener detalle de debate inexistente | 404 y mensaje de debate no encontrado | OK (404 y mensaje de error) |
| Publicar comentario con datos válidos por usuario autenticado | 201 y comentario creado | OK (201 y comentario creado) |
| Publicar comentario sin autenticación | 401 y error de autenticación | OK (401 y token requerido) |
| Publicar comentario en debate inexistente | 404 y mensaje de debate no encontrado | OK (404 y debate no encontrado) |
| Publicar comentario con contenido vacío | 400 y mensaje de error | OK (400 y mensaje de error) |

### Tests automáticos previstos

- `backend/tests/debates.test.js`

## AI_LOG

### Herramienta usada

- Herramienta: Antigravity
- Modelo: Gemini 3.8 Flash
- Tipo: asistente de desarrollo

### Uso realizado

Se usó la IA para:

- estructurar la especificación (SPEC) y plan (PLAN) de la iteración de debates y comentarios conforme a las especificaciones globales del proyecto;
- definir los contratos de los endpoints para obras y debates asegurando el cumplimiento de los tipos de usuario (visitante vs autenticado);
- diseñar e implementar el esquema SQL de las tablas `debates` y `debate_comments` con claves foráneas en `schema.sql`;
- implementar la capa de modelos (`debateModel.js` y `commentModel.js`) con consultas SQL relacionales;
- implementar el servicio `debateService.js` con las validaciones de negocio e integridad referencial;
- implementar el controlador `debateController.js` y las rutas en `debateRoutes.js` y `workRoutes.js`;
- diseñar e implementar la batería de 12 pruebas automáticas en `debates.test.js`.

### Prompts importantes

- “te he creado el documento de la iteración cuatro, completa el documento antes de empezar con el código”
- “vale, adelante”

### Resultado

La IA implementó por completo la funcionalidad de debates y comentarios en el backend y verificó que los 26 tests automáticos (14 anteriores + 12 nuevos) pasasen satisfactoriamente sin errores.

### Decisión del estudiante

- Se aceptó la división de responsabilidades y las rutas REST (`POST /api/works/:workId/debates`, `GET /api/debates`, `GET /api/debates/:id` y `POST /api/debates/:id/comments`).
- Se acordó que la lectura de debates y comentarios sea pública para visitantes, mientras que la creación requiere autenticación con JWT.

### Correcciones manuales

- Se ajustó la redacción del primer requisito para no restringirlo únicamente a PostgreSQL, reflejando el diseño de las tablas con claves foráneas.
- Se renombró el archivo de la iteración a `04-debates.md` para seguir la convención del repositorio.

## COMMITS RELACIONADOS

- Pendiente de creación durante el desarrollo de la iteración.
