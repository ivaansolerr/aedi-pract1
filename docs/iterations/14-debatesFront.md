# Iteración 14 - Gestión de debates en el detalle de obra

## SPEC

### Objetivo

Integrar la gestión del recurso secundario dentro de la ficha de detalle de una obra, permitiendo a los visitantes consultar los hilos de debate y a los miembros autenticados crear, consultar y eliminar debates con control estricto de autoría.

### Requisitos

- Cualquier visitante o miembro puede consultar la lista de debates asociados a una obra dentro de su ficha de detalle.
- Cada debate debe mostrar su título, descripción, autor o fecha de creación.
- Si una obra no tiene debates abiertos, la aplicación debe mostrar un mensaje amigable invitando a iniciar la primera conversación.
- Los miembros autenticados pueden abrir un nuevo debate vinculado a la obra mediante un formulario con validación de campos obligatorios (título y descripción).
- El listado de debates debe soportar paginación cuando el número de conversaciones exceda el límite por página.
- Un usuario autenticado solo puede eliminar debates creados por él mismo, aplicando control visual de autoría en la interfaz.
- Los visitantes o usuarios que no sean los autores de un debate no deben visualizar los botones de eliminación.
- Al eliminar un debate propio, el sistema debe solicitar confirmación previa mediante un diálogo modal y notificar el resultado.
- La creación o eliminación de debates debe actualizar de inmediato el listado dentro de la ficha sin recargar la página.

### Fuera de alcance

- Chat privado en tiempo real y mensajería directa (Supabase Realtime).
- Edición de comentarios anidados (se prioriza el ciclo de creación, consulta y borrado del debate).

---

## PLAN

1. **Capa de Servicios de Debates (`src/services/debateService.js`)**:
   - Crear el servicio `debateService.js` para abstraer los endpoints de debates:
     * `getDebatesByWork({ workId, page, limit })`: envía `GET /api/debates?work_id=:workId&page=:page&limit=:limit`.
     * `createDebateForWork(workId, { title, description })`: envía `POST /api/works/:workId/debates`.
     * `deleteDebate(id)`: envía `DELETE /api/debates/:id`.

2. **Gestión de Estado de Debates con Pinia (`src/stores/debates.js`)**:
   - Crear el store `useDebatesStore` con estado reactivo:
     * `debates`: Array de debates de la obra activa.
     * `pagination`: Objeto con `{ total, page, limit, totalPages }`.
     * `isLoading`: Indicador booleano de carga.
     * `errorMessage`: Mensaje en caso de error.
   - Acciones:
     * `fetchDebatesForWork({ workId, page, limit })`: consulta la API y actualiza la lista y paginación.
     * `createDebate(workId, payload)`: envía la creación y refresca la lista.
     * `deleteDebate(debateId)`: envía la eliminación y retira el elemento del estado local.
     * `setPage(workId, page)`: actualiza la página y consulta la nueva página de debates.

3. **Componente de Tarjeta de Debate (`src/components/DebateCard.vue`)**:
   - Muestra título, descripción y fecha relativa o formateada.
   - **Control de autoría**: compara el identificador del usuario autenticado (`authStore.user?.id`) con el autor del debate (`debate.user_id`):
     * Si coincide: renderiza el botón "Eliminar debate" (`Button` con icono de papelera).
     * Si no coincide o es visitante: el botón se omite completamente del DOM.
   - Al solicitar eliminar, activa `ConfirmDialog` de PrimeVue para confirmar la acción antes de proceder.

4. **Componente de Sección de Debates (`src/components/WorkDebatesSection.vue`)**:
   - Se incrusta directamente en `WorkDetailView.vue` recibiendo el `workId`.
   - Encabezado con contador total de debates.
   - **Formulario de creación de debate**:
     * Visible para usuarios autenticados (`InputText` para título, `Textarea` para descripción y botón de publicar).
     * Validación en cliente: campos obligatorios y longitudes mínimas.
     * Para visitantes: banner informativo invitando a iniciar sesión para abrir un debate.
   - **Listado y paginación**:
     * Renderiza la lista de `DebateCard`.
     * Estado de carga con indicador (`ProgressSpinner`).
     * Estado vacío amigable cuando `total === 0` ("Esta obra aún no tiene debates abiertos. ¡Sé el primero en iniciar una conversación!").
     * Componente `Paginator` de PrimeVue sincronizado con los metadatos de paginación de debates.

5. **Integración en `WorkDetailView.vue`**:
   - Reemplazar el bloque provisional de debates por `<WorkDebatesSection :work-id="work.id" />`.

6. **Pruebas automáticas (Vitest)**:
   - Tests de `debateService.spec.js`: llamadas a `GET /debates`, `POST /works/:id/debates` y `DELETE /debates/:id`.
   - Tests de `debates.spec.js`: acciones de carga, creación, borrado y paginación en el store.
   - Tests de `DebateCard.spec.js`: renderizado de contenido y control estricto de visibilidad del botón de borrado según la autoría del usuario.
   - Tests de `WorkDebatesSection.spec.js`: validación de formulario, estado vacío y formulario condicional según sesión.
   - Verificación de la suite global completa y compilación con `npm run build`.

### Decisiones relevantes

- Se modulariza la lógica del recurso secundario en un componente especializado (`WorkDebatesSection.vue`) y un store dedicado (`useDebatesStore`), evitando sobrecargar la vista principal de detalle de la obra.
- El control de permisos de borrado se aplica evaluando la autoría (`authStore.user?.id === debate.user_id`), impidiendo que un usuario intente borrar debates ajenos desde la interfaz.
- La paginación de debates utiliza el `Paginator` de PrimeVue conectado con `page` y `limit` del backend, permitiendo navegar entre debates sin afectar la vista de la obra.

### Riesgos y dudas

- Asegurar que al eliminar un debate o crear uno nuevo se recalcule la paginación correctamente para no dejar páginas vacías.

---

## TEST_PLAN

### Pruebas automáticas previstas

Se usan pruebas automáticas con `vitest` y `@vue/test-utils` para verificar la gestión de debates, el store de Pinia y el control de autoría en los componentes.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Obtener debates de una obra en `debateService` | Realiza `GET /debates?work_id=:id` y retorna debates paginados | OK (Petición GET enviada con query params y retorno esperado) |
| Crear debate para una obra en `debateService` | Realiza `POST /works/:id/debates` con título y descripción | OK (POST enviado con payload y debate retornado) |
| Eliminar debate en `debateService` | Realiza `DELETE /debates/:id` | OK (DELETE enviado con ID y confirmación exitosa) |
| Cargar debates en `useDebatesStore` | Actualiza la lista de debates y los metadatos de paginación | OK (Lista de debates y paginación actualizadas) |
| Crear debate en `useDebatesStore` | Envía el debate al backend y actualiza el estado | OK (Debate creado y listado recargado) |
| Eliminar debate en `useDebatesStore` | Elimina el debate del backend y lo retira de la lista local | OK (Debate retirado del estado local y total actualizado) |
| Cambiar de página en `useDebatesStore` | Actualiza la página actual y consulta los debates correspondientes | OK (Página sincronizada y debates de página 2 solicitados) |
| Renderizar información del debate en `DebateCard` | Muestra título, descripción y fecha de publicación | OK (Todos los campos visualizados correctamente) |
| Mostrar botón de eliminar si el usuario es el autor | El creador del debate visualiza el botón de borrado | OK (Botón eliminar visible para el autor legítimo) |
| Ocultar botón de eliminar si el usuario NO es el autor | Usuarios que no son el autor no visualizan el botón de borrado | OK (Botón eliminar oculto para otros miembros) |
| Ocultar botón de eliminar a visitantes | Visitante no visualiza el botón de borrado en ningún debate | OK (Botón eliminar ausente para usuarios no autenticados) |
| Validar formulario de debate con campos vacíos | Bloquea el envío y muestra mensajes de título y descripción obligatorios | OK (Validación bloquea submit y alerta sobre campos vacíos) |
| Mostrar estado vacío cuando la obra no tiene debates | Muestra mensaje de "No hay debates aún" e invita a crear uno | OK (Estado vacío amigable renderizado) |

### Tests automáticos previstos

- `frontend-vue/src/services/__tests__/debateService.spec.js` (3 tests)
- `frontend-vue/src/stores/__tests__/debates.spec.js` (5 tests)
- `frontend-vue/src/components/__tests__/DebateCard.spec.js` (4 tests)
- `frontend-vue/src/components/__tests__/WorkDebatesSection.spec.js` (4 tests)
- `frontend-vue/src/views/__tests__/WorkDetailView.spec.js` (4 tests)
- `frontend-vue/src/views/__tests__/WorkFormView.spec.js` (3 tests)
- `frontend-vue/src/views/__tests__/WorksListView.spec.js` (5 tests)
- `frontend-vue/src/components/__tests__/WorkCard.spec.js` (3 tests)
- `frontend-vue/src/components/__tests__/AppNavbar.spec.js` (3 tests)
- `frontend-vue/src/views/__tests__/LoginView.spec.js` (4 tests)
- `frontend-vue/src/stores/__tests__/works.spec.js` (10 tests)
- `frontend-vue/src/services/__tests__/workService.spec.js` (5 tests)
- `frontend-vue/src/stores/__tests__/auth.spec.js` (5 tests)
- `frontend-vue/src/services/__tests__/authService.spec.js` (4 tests)

Total acumulado en el frontend: **14 suites y 62 pruebas automáticas superadas con éxito (100%)**.

---

## AI_LOG

### Herramienta usada

- Herramienta: Antigravity
- Modelo: Gemini 3.8 Flash
- Tipo: asistente de desarrollo

### Uso realizado

Se usó la IA para:
- Estructurar la especificación (SPEC), plan (PLAN) y plan de pruebas (TEST_PLAN) de la iteración 14 para la gestión de debates (recurso secundario) dentro de la ficha técnica de la obra.
- Crear el servicio `src/services/debateService.js` con las operaciones `getDebatesByWork`, `createDebateForWork`, `getDebateById` y `deleteDebate`.
- Desarrollar el store reactivo `useDebatesStore` con manejo de debates asociados a una obra, paginación server-side, creación y borrado.
- Diseñar el componente `DebateCard.vue` con control estricto de autoría (`authStore.user?.id === debate.user_id`) y confirmación modal de eliminación con PrimeVue `ConfirmDialog`.
- Construir el componente interactivo `WorkDebatesSection.vue` con formulario de alta de debates (para usuarios con sesión activa), banner de invitación para visitantes, aviso de estado vacío y paginador `Paginator` integrado.
- Integrar la sección de debates dentro de `WorkDetailView.vue` sustituyendo el marcador estático provisional.
- Diseñar e implementar 16 nuevas pruebas automáticas con Vitest y `@vue/test-utils` para debates, alcanzando 62 pruebas automáticas superadas con 100% de éxito.
- Verificar la compilación para producción con `npm run build`.

### Prompts importantes

- "te he creado el documento de la iteración 14 con el spec"
- "no mezcles los debates con el código principal de la obra: encapsula la lista y el formulario de debates en un componente independiente WorkDebatesSection dentro de la ficha"
- "si el usuario no está logueado, muestra un banner que le invite a iniciar sesión para participar en el debate en vez de mostrarle el formulario"
- "en los tests de componentes aísla WorkDebatesSection con un stub en la vista de detalle y añade el mock de debateService.getDebatesByWork en su propia suite para evitar llamadas reales"
- "perfecto, implementalo"

### Resultado

Implementación completa y validada de la gestión del recurso secundario (debates vinculados a una obra ficticia), con control estricto de autoría en el borrado, formulario con validación y paginación server-side. El frontend alcanza 62 pruebas automáticas con 100% de éxito y el build de producción se genera limpiamente.

### Decisión del estudiante

- Se acordó encapsular toda la lógica y visualización de los debates en el componente `WorkDebatesSection.vue` y el store `useDebatesStore` para mantener limpio y desacoplado el componente de detalle de la obra.
- Se implementó la restricción estricta de autoría en la interfaz ocultando el botón de eliminación a cualquier visitante o usuario que no sea el creador del debate (`authStore.user?.id === debate.user_id`).
- Se definió un flujo condicional de interacción: los usuarios autenticados disponen del formulario de publicación directa, mientras que a los visitantes no autenticados se les muestra un aviso informativo para iniciar sesión.
- Se reutilizó el servicio global `ConfirmDialog` de PrimeVue para confirmar la eliminación de debates.

### Correcciones manuales

- Inclusión del stub de `WorkDebatesSection` en las pruebas de `WorkDetailView.spec.js` para desacoplar el test de ficha de obra de la sección de debates.
- Mock explícito de `debateService.getDebatesByWork` en `WorkDebatesSection.spec.js` para evitar peticiones reales de red durante el ciclo de vida `onMounted` en entorno jsdom.

---

## COMMITS RELACIONADOS

- "4bc1fc8b41ff5891f1c176a2e8cae7c38d362816"
