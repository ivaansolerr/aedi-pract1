# Iteración 09 - CRUD Completo de Debates

## SPEC

### Objetivo

Implementar la modificación y eliminación de debates y comentarios, garantizando las restricciones de acceso y autoría para que los usuarios gestionen sus propias aportaciones.

### Requisitos

- Un usuario autenticado puede modificar el título y la descripción de un debate creado por él.
- No se permite modificar un debate dejando el título o la descripción vacíos.
- Un usuario no puede modificar debates creados por otros usuarios.
- Un usuario autenticado puede eliminar un debate creado por él.
- Un usuario no puede eliminar debates creados por otros usuarios.
- Al eliminar un debate, se eliminan automáticamente sus comentarios y suscripciones vinculados.
- Un usuario autenticado puede eliminar un comentario publicado por él en un debate.
- Un usuario no puede eliminar comentarios publicados por otros usuarios.
- Un usuario autenticado puede modificar los datos de una obra existente o eliminarla.
- Todas las operaciones de modificación y eliminación requieren autenticación.
- Responder con error adecuado si el debate, comentario u obra no existen.

### Fuera de alcance

- Historial de versiones o recuperación de elementos eliminados.
- Edición de comentarios (solo creación y borrado en esta fase).

---

## PLAN

1. Actualizar `src/models/debateModel.js`:
   - `updateDebate({ id, title, description })` para actualizar el título y la descripción.
   - `deleteDebate(id)` para eliminar un debate por su identificador.
2. Actualizar `src/models/commentModel.js`:
   - `findCommentById(id)` para obtener un comentario por su identificador.
   - `deleteComment(id)` para eliminar un comentario.
3. Actualizar `src/models/workModel.js`:
   - `updateWork({ id, title, type, genre, release_year, duration, synopsis })` para actualizar una obra.
   - `deleteWork(id)` para eliminar una obra.
4. Extender `src/services/debateService.js`:
   - `editDebate({ debateId, userId, title, description })`: valida existencia del debate (404), autoría del usuario (403) y campos obligatorios (400).
   - `removeDebate({ debateId, userId })`: valida existencia (404), autoría del usuario (403) y elimina el debate.
   - `removeComment({ debateId, commentId, userId })`: valida existencia del debate (404) y del comentario (404), pertenencia del comentario al debate (400), autoría del usuario (403) y elimina el comentario.
5. Extender `src/services/workService.js`:
   - `updateWorkById({ id, data })`: valida campos requeridos (400) y existencia (404) para actualizar la obra.
   - `deleteWorkById(id)`: valida existencia (404) y elimina la obra.
6. Actualizar `src/controllers/debateController.js` y `src/controllers/workController.js`:
   - En `debateController.js`: añadir `update`, `remove` y `deleteCommentHandler`.
   - En `workController.js`: añadir `update` y `remove`.
7. Actualizar rutas en `src/routes/debateRoutes.js` y `src/routes/workRoutes.js`:
   - `PUT /api/debates/:id` (protegida con `authMiddleware`).
   - `DELETE /api/debates/:id` (protegida con `authMiddleware`).
   - `DELETE /api/debates/:id/comments/:commentId` (protegida con `authMiddleware`).
   - `PUT /api/works/:id` (protegida con `authMiddleware`).
   - `DELETE /api/works/:id` (protegida con `authMiddleware`).
8. Diseñar e implementar pruebas automáticas para comprobar:
   - Modificación exitosa de debate propio.
   - Rechazo de modificación de debate ajeno (403).
   - Rechazo de modificación con campos vacíos (400).
   - Eliminación exitosa de debate propio y borrado en cascada.
   - Rechazo de eliminación de debate ajeno (403).
   - Eliminación exitosa de comentario propio.
   - Rechazo de eliminación de comentario ajeno (403).
   - Modificación y eliminación de obras.
   - Control de acceso sin autenticación (401).
9. Ejecutar la batería de tests (`npm test`) y verificar que todos los casos pasan satisfactoriamente.

### Decisiones relevantes

- Se aplica un control estricto de autoría: tanto en debates como en comentarios, únicamente el usuario creador puede modificar o eliminar sus propios contenidos, respondiendo con HTTP 403 ante cualquier intento de manipulación no autorizada.
- La eliminación de debates y obras se apoya en las claves foráneas con `ON DELETE CASCADE` de PostgreSQL para mantener la integridad referencial sin dejar registros huérfanos.

### Riesgos y dudas

- Asegurar que al eliminar un comentario se compruebe tanto que el debate existe como que el comentario pertenece a ese debate en concreto.

---

## TEST_PLAN

### Pruebas automáticas previstas

Se usarán pruebas automáticas con `node:test` y `supertest` para validar el ciclo CRUD completo y el control de autoría.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Modificar un debate propio con datos válidos | 200 y debate actualizado | OK (200 y debate actualizado) |
| Rechazar modificación de debate ajeno | 403 y mensaje de acceso denegado | OK (403 y falta de permisos) |
| Rechazar modificación con campos obligatorios vacíos | 400 y mensaje de error | OK (400 y campos obligatorios requeridos) |
| Modificar debate inexistente | 404 y mensaje de debate no encontrado | OK (404 y debate no encontrado) |
| Eliminar un debate propio | 200 y mensaje de confirmación | OK (200 y debate eliminado) |
| Rechazar eliminación de debate ajeno | 403 y mensaje de acceso denegado | OK (403 y falta de permisos) |
| Eliminar debate inexistente | 404 y mensaje de debate no encontrado | OK (404 y debate no encontrado) |
| Eliminar un comentario propio en un debate | 200 y mensaje de confirmación | OK (200 y comentario eliminado) |
| Rechazar eliminación de comentario ajeno | 403 y mensaje de acceso denegado | OK (403 y falta de permisos) |
| Eliminar comentario inexistente | 404 y mensaje de error | OK (404 y comentario no encontrado) |
| Modificar una obra existente | 200 y obra actualizada | OK (200 y obra actualizada) |
| Eliminar una obra existente | 200 y confirmación | OK (200 y obra eliminada) |
| Rechazar modificaciones y eliminaciones sin autenticación | 401 y token requerido | OK (401 y autenticación requerida) |

### Tests automáticos previstos

- `backend/tests/debates.test.js`
- `backend/tests/works.test.js`

---

## AI_LOG

### Herramienta usada

- Herramienta: Antigravity
- Modelo: Gemini 3.8 Flash
- Tipo: asistente de desarrollo

### Uso realizado

Se usó la IA para:

- estructurar la especificación (SPEC) y plan (PLAN) del ciclo CRUD completo para cumplir con la rúbrica oficial de la asignatura;
- definir los endpoints de modificación y eliminación con restricciones de autoría (HTTP 403);
- planificar las consultas SQL de actualización y borrado en los modelos de debates, comentarios y obras;
- diseñar e implementar la batería de pruebas automáticas en `backend/tests/debates.test.js` y `backend/tests/works.test.js`;
- ejecutar la batería completa de tests y validar el 100% de éxito (81 tests pasando).

### Prompts importantes

- “ya tienes el documento de la iteración 9”
- “de acuerdo, completala”

### Resultado

Implementación del ciclo CRUD completo finalizada y validada. Se añadieron los endpoints de actualización y eliminación de obras, debates y comentarios respetando las reglas de autoría (HTTP 403). La batería de tests pasa al 100% (81 pruebas superadas, 0 fallos).

### Decisión del estudiante

- Se decidió permitir únicamente al autor original modificar o eliminar debates y comentarios para garantizar la integridad de las opiniones.
- Se acordó que la eliminación de debates aproveche el borrado en cascada para limpiar comentarios y suscripciones.

### Correcciones manuales

- Ajuste en el generador de tokens de prueba para evitar colisiones de email en tests con múltiples usuarios.

---

## COMMITS RELACIONADOS

- "d4240e3a01a637109de2f972194c038df7253035"

