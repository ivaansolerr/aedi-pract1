# Iteración 07 - Sistema de mensajes privados

## SPEC

### Objetivo

Implementar el sistema de mensajería privada directa entre usuarios, permitiendo mantener conversaciones uno a uno y garantizando la restricción de comunicación en caso de bloqueo.

### Requisitos

- Un usuario autenticado puede enviar un mensaje privado a otro usuario.
- El contenido del mensaje no puede estar vacío.
- Un usuario no puede enviarse mensajes a sí mismo.
- No se pueden enviar mensajes si existe una relación de bloqueo entre ambos usuarios (tanto si el emisor ha bloqueado al receptor como si el receptor ha bloqueado al emisor).
- Un usuario autenticado puede consultar el historial cronológico de mensajes intercambiados con otro usuario.
- Un usuario autenticado puede ver la lista de sus conversaciones activas con el último mensaje correspondiente.
- Un usuario autenticado puede marcar como leídos los mensajes que ha recibido.
- Las conversaciones son estrictamente privadas y solo pueden ser consultadas por sus participantes.
- Todas las rutas de mensajería requieren autenticación.
- Responder con error adecuado si el usuario destinatario o el mensaje no existen.

### Fuera de alcance

- Chats grupales o canales compartidos (se limitan a conversaciones individuales entre dos usuarios).
- Envío de archivos multimedia o notas de voz.
- Edición o eliminación de mensajes enviados.

---

## PLAN

1. Actualizar `backend/schema.sql` para definir la tabla `direct_messages`:
   - `direct_messages (id, sender_id, receiver_id, content, read, created_at)`.
   - Claves foráneas hacia `users(id)` con `ON DELETE CASCADE`.
2. Actualizar `src/config/db.js` para registrar la tabla en `pg-mem` y añadir su limpieza en `cleanDb()`.
3. Instalar la dependencia oficial `@supabase/supabase-js` y crear el módulo de configuración `src/config/supabase.js`:
   - Inicializar el cliente si se configuran `SUPABASE_URL` y `SUPABASE_KEY`.
   - Si no están definidas las variables (entorno de pruebas en local), operar en modo resiliente sin bloquear la ejecución de la API ni los tests.
4. Crear el modelo `src/models/messageModel.js`:
   - `createMessage({ sender_id, receiver_id, content })`
   - `findConversation({ userId1, userId2 })`
   - `findConversationsByUser(userId)`
   - `findMessageById(id)`
   - `markMessageAsRead(id)`
   - `sanitizeMessage(message)`
5. Crear el servicio `src/services/messageService.js`:
   - Validar que emisor y receptor sean distintos.
   - Validar contenido no vacío.
   - Verificar existencia del destinatario.
   - Comprobar en `user_relationships` que no exista un bloqueo mutuo o unidireccional (lanzar error HTTP 403 en tal caso).
   - Guardar el mensaje en base de datos.
   - Emitir evento a Supabase Realtime si el cliente está conectado.
   - Listar mensajes de la conversación y lista de conversaciones activas.
   - Marcar mensaje como leído validando que el usuario autenticado sea el receptor (HTTP 403 si no lo es).
6. Crear el controlador `src/controllers/messageController.js`:
   - `sendMessage`
   - `getConversation`
   - `getConversations`
   - `markAsRead`
7. Definir las rutas en `src/routes/messageRoutes.js` y montarlas en `src/app.js`:
   - `POST /api/messages` (protegida con `authMiddleware`)
   - `GET /api/messages/conversations` (protegida con `authMiddleware`)
   - `GET /api/messages/:targetUserId` (protegida con `authMiddleware`)
   - `PATCH /api/messages/:id/read` (protegida con `authMiddleware`)
8. Diseñar la batería de pruebas en `backend/tests/messages.test.js` con casos positivos y negativos:
   - Envío de mensajes exitoso.
   - Rechazo de auto-mensajes y mensajes vacíos.
   - Rechazo de envío a usuario bloqueado o por usuario bloqueado (HTTP 403).
   - Consulta de conversación y de lista de conversaciones.
   - Marcar mensaje como leído y control de acceso.
9. Ejecutar `npm test` y verificar que la suite completa supera las pruebas sin fallos.

### Decisiones relevantes

- La validación de bloqueo se realiza en ambas direcciones: si el usuario A bloqueó a B, o si B bloqueó a A, el envío se rechaza con HTTP 403, asegurando la privacidad y protección requerida en `PROJECT_SPEC.md`.
- El cliente de Supabase se configura de forma tolerante a fallos para permitir que los tests automáticos se ejecuten localmente al instante sin requerir conexión a internet ni credenciales remotas obligatorias.

### Riesgos y dudas

- Asegurar que la consulta de conversaciones agrupe correctamente por los dos participantes y recupere el mensaje más reciente de forma eficiente.

---

## TEST_PLAN

### Pruebas automáticas previstas

Se usarán pruebas automáticas con `node:test` y `supertest` para validar el funcionamiento del chat y las restricciones de bloqueo.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Enviar mensaje a otro usuario con datos válidos | 201 y mensaje creado con IDs | OK (201 y mensaje creado) |
| Rechazar envío de mensaje a uno mismo | 400 y mensaje de error | OK (400 y auto-envío rechazado) |
| Rechazar envío de mensaje con contenido vacío | 400 y mensaje de error | OK (400 y contenido vacío rechazado) |
| Rechazar envío a usuario inexistente | 404 y mensaje de usuario no encontrado | OK (404 y usuario no existe) |
| Rechazar envío si el emisor ha bloqueado al destinatario | 403 y mensaje de bloqueo | OK (403 y bloqueo activo) |
| Rechazar envío si el destinatario ha bloqueado al emisor | 403 y mensaje de bloqueo | OK (403 y bloqueo activo) |
| Obtener conversación cronológica entre dos usuarios | 200 y array de mensajes | OK (200 y conversación cronológica) |
| Listar conversaciones activas del usuario autenticado | 200 y lista de conversaciones | OK (200 y lista de conversaciones con último mensaje) |
| Marcar como leído un mensaje recibido | 200 y mensaje con `read: true` | OK (200 y `read: true`) |
| Rechazar marcar como leído un mensaje que no fue recibido por el usuario | 403 y acceso denegado | OK (403 y acceso denegado) |
| Acceder a rutas de mensajes sin autenticación | 401 y token requerido | OK (401 y token requerido) |

### Tests automáticos previstos

- `backend/tests/messages.test.js`

---

## AI_LOG

### Herramienta usada

- Herramienta: Antigravity
- Modelo: Gemini 3.8 Flash
- Tipo: asistente de desarrollo

### Uso realizado

Se usó la IA para:

- estructurar la especificación (SPEC) y plan (PLAN) de la iteración de mensajería privada con requisitos funcionales y directos;
- definir los contratos de los endpoints (`/api/messages`, `/api/messages/conversations`, `/api/messages/:targetUserId`, `/api/messages/:id/read`);
- diseñar e implementar la tabla `direct_messages` con claves foráneas en `schema.sql`;
- configurar el cliente oficial de Supabase (`@supabase/supabase-js`) con fallback resiliente en local;
- implementar el modelo `messageModel.js` y el servicio `messageService.js` con las restricciones de bloqueo mutuo;
- crear el controlador `messageController.js` y las rutas `messageRoutes.js` montadas en `app.js`;
- diseñar e implementar la batería de 11 pruebas automáticas en `messages.test.js`.

### Prompts importantes

- “ya tienes el archivo de la iteración 7, completalo, no tengo el proyecto aún creado en supabase lo creo o como lo hacemos?”
- “adelante, completala”

### Resultado

Implementación completa y validada de la mensajería privada y del módulo de Supabase. La suite completa de 60 tests automáticos pasa al 100% sin ningún fallo.

### Decisión del estudiante

- Se acordó diseñar la integración con Supabase de forma resiliente, permitiendo ejecutar y validar todas las funciones y tests localmente antes de crear el proyecto en la nube.
- Se aceptó aplicar la restricción de bloqueo bidireccional (bloqueo tanto si emisor bloquea a receptor como si receptor bloquea a emisor) retornando HTTP 403.

### Correcciones manuales

- Redacción funcional simplificada de los requisitos en la SPEC.

---

## COMMITS RELACIONADOS

- "8f47a90dd18b349c6937e9d2263e05ef7cee5a92"
