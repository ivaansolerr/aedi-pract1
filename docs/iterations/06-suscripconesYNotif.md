# Iteración 06 - Notificaciones y suscripciones en debates

## SPEC

### Objetivo

Implementar el sistema de suscripciones a debates y la generación y consulta de notificaciones para notificar a los usuarios de nueva actividad cuando se publiquen comentarios en los debates que siguen.

### Requisitos

- Un usuario autenticado puede suscribirse y desuscribirse de un debate.
- Un usuario no puede duplicar su suscripción al mismo debate.
- Al publicar un comentario en un debate, se debe notificar a los usuarios suscritos a él.
- El autor de un comentario no recibe notificación de su propio comentario.
- Un usuario autenticado puede ver la lista de sus notificaciones recibidas.
- Las notificaciones deben indicar si han sido leídas o no.
- Un usuario puede marcar sus notificaciones como leídas.
- Un usuario no puede marcar ni modificar las notificaciones de otros usuarios.
- Las rutas de suscripción y consulta de notificaciones requieren autenticación.
- Responder con error adecuado si el debate o la notificación no existen.

### Fuera de alcance

- Notificaciones push o por correo electrónico.
- Notificaciones por menciones directas (@usuario).
- Eliminación de notificaciones.
- Conexión en tiempo real por WebSockets.

---

## PLAN

1. Actualizar `backend/schema.sql` para definir las tablas `debate_subscriptions` y `notifications` con claves foráneas e integridad referencial (`ON DELETE CASCADE`):
   - `debate_subscriptions (id, debate_id, user_id, created_at)` con restricción `UNIQUE(debate_id, user_id)`.
   - `notifications (id, user_id, debate_id, comment_id, is_read, created_at)`.
2. Actualizar `src/config/db.js` para registrar ambas tablas en `pg-mem` y ajustar `cleanDb()` para vaciar las tablas en el orden correcto de dependencias.
3. Crear el modelo `src/models/subscriptionModel.js`:
   - `findSubscription({ debate_id, user_id })`
   - `createSubscription({ debate_id, user_id })`
   - `deleteSubscription({ debate_id, user_id })`
   - `findSubscribersByDebateId(debate_id)`
4. Crear el modelo `src/models/notificationModel.js`:
   - `createNotificationsForSubscribers({ debate_id, comment_id, author_id, subscribers })`
   - `findNotificationsByUserId(user_id)`
   - `findNotificationById(id)`
   - `markNotificationAsRead(id)`
   - `sanitizeNotification(notification)`
5. Crear el servicio `src/services/notificationService.js`:
   - Lógica de toggle para suscribir/desuscribir a un debate validando su existencia previa.
   - Generación automática de notificaciones al publicar un comentario en `debateService.js`.
   - Consulta de notificaciones del usuario.
   - Marcar notificación como leída con validación de propiedad (403 si no pertenece al usuario).
6. Adaptar `src/services/debateService.js` para invocar la creación de notificaciones tras insertar un comentario en `createComment`.
7. Crear el controlador `src/controllers/notificationController.js`:
   - `toggleSubscription`
   - `getNotifications`
   - `markAsRead`
8. Definir las rutas y montarlas en `src/app.js`:
   - `POST /api/debates/:id/subscribe` en `debateRoutes.js` (protegida con `authMiddleware`).
   - `GET /api/notifications` en `notificationRoutes.js` (protegida con `authMiddleware`).
   - `PATCH /api/notifications/:id/read` en `notificationRoutes.js` (protegida con `authMiddleware`).
9. Diseñar la suite de pruebas automáticas en `backend/tests/notifications.test.js` con casos positivos y negativos.
10. Ejecutar la batería de tests automáticos (`npm test`) y verificar que todos los casos (existentes y nuevos) pasen limpiamente.

### Decisiones relevantes

- Se adopta la ruta `POST /api/debates/:id/subscribe` como un *toggle* atómico (crear suscripción si no existe, o eliminarla si ya existía), reduciendo la complejidad del cliente y ajustándose a la arquitectura descrita en `ARCHITECTURE.md`.
- La generación de notificaciones se desacopla dentro de la lógica del servicio para asegurar que si un comentario se crea correctamente, todos los suscriptores reciban su alerta, excluyendo siempre al autor de la publicación.
- La validación de propiedad de la notificación garantiza que ningún usuario pueda marcar como leída una alerta ajena (retornando HTTP 403).

### Riesgos y dudas

- Asegurar el orden de truncado/borrado en `cleanDb()` para evitar violaciones de clave foránea (`notifications` y `debate_subscriptions` deben limpiarse antes de `debate_comments` y `debates`).

---

## TEST_PLAN

### Pruebas automáticas previstas

Se usarán pruebas automáticas con `node:test` y `supertest` para validar el funcionamiento del sistema de suscripciones y notificaciones.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Suscribirse a un debate existente por usuario autenticado | 200/201 con `subscribed: true` | OK (200 y `subscribed: true`) |
| Desuscribirse del debate al volver a llamar al endpoint | 200 con `subscribed: false` | OK (200 y `subscribed: false`) |
| Intentar suscribirse a un debate sin autenticación | 401 y mensaje de error | OK (401 y token requerido) |
| Intentar suscribirse a un debate inexistente | 404 y mensaje de debate no encontrado | OK (404 y debate no existe) |
| Publicar comentario genera notificación a usuarios suscritos | 201 y notificación creada para el suscriptor | OK (201 y notificación vinculada creada) |
| Publicar comentario NO genera notificación para el autor del comentario | 201 y 0 notificaciones para el autor | OK (201 y 0 notificaciones para el autor) |
| Listar notificaciones del usuario autenticado | 200 y array de notificaciones | OK (200 y array de notificaciones del usuario) |
| Listar notificaciones sin autenticación | 401 y mensaje de error | OK (401 y token requerido) |
| Marcar notificación propia como leída | 200 y notificación con `is_read: true` | OK (200 y `is_read: true`) |
| Marcar como leída una notificación inexistente | 404 y mensaje de error | OK (404 y notificación no encontrada) |
| Intentar marcar como leída una notificación de otro usuario | 403 y mensaje de acceso denegado | OK (403 y acceso denegado) |

### Tests automáticos previstos

- `backend/tests/notifications.test.js`

---

## AI_LOG

### Herramienta usada

- Herramienta: Antigravity
- Modelo: Gemini 3.8 Flash
- Tipo: asistente de desarrollo

### Uso realizado

Se usó la IA para:

- estructurar la especificación (SPEC) y plan (PLAN) de la iteración de notificaciones y suscripciones;
- definir los contratos de los endpoints (`/api/debates/:id/subscribe`, `/api/notifications`, `/api/notifications/:id/read`);
- diseñar el esquema DDL de `debate_subscriptions` y `notifications` con claves foráneas en `schema.sql`;
- implementar los modelos de datos `subscriptionModel.js` y `notificationModel.js`;
- implementar el servicio `notificationService.js` e integrarlo en `debateService.js` para generar notificaciones automáticamente al comentar;
- crear el controlador `notificationController.js` y las rutas `notificationRoutes.js` y `debateRoutes.js`;
- diseñar e implementar la batería de 11 pruebas automáticas en `notifications.test.js`.

### Prompts importantes

- “te he dejado el documento de la 6ta iteración con los requisitos y la explicación, complétala”
- “no quiero que los requisitos sean tan técnicos y tan extensos”
- “adelante lleva a cabo la iteración”

### Resultado

Implementación completa y validada en el backend. Las 11 nuevas pruebas automáticas se ejecutan de manera satisfactoria junto a las 38 pruebas anteriores, totalizando 49 pruebas exitosas con 0 fallos.

### Decisión del estudiante

- Se acordó simplificar los requisitos funcionales del documento para evitar tecnicismos excesivos en la SPEC.
- Se aceptó la implementación basada en un toggle atómico para la suscripción a debates (`POST /api/debates/:id/subscribe`).
- Se aceptó el control de acceso estricto (403) para evitar que un usuario manipule notificaciones ajenas.

### Correcciones manuales

- Redacción simplificada y orientada al usuario de los requisitos en la SPEC.

---

## COMMITS RELACIONADOS

- Pendiente de creación durante el desarrollo de la iteración.
