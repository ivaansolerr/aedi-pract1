# Iteración 13 - Detalle de obra y CRUD completo

## SPEC

### Objetivo

Permitir la consulta de la ficha detallada de una obra y proporcionar a los miembros autenticados las funcionalidades para crear, modificar y eliminar obras, garantizando la validación de datos y la confirmación de acciones destructivas.

### Requisitos

- Cualquier visitante o miembro puede acceder a la ficha técnica completa de una obra seleccionándola desde el catálogo.
- La vista de detalle debe presentar toda la información de la obra: título, tipo, género, año de estreno, duración y sinopsis íntegra.
- Un usuario autenticado puede acceder al formulario para dar de alta una nueva obra en la plataforma.
- El formulario de obra debe validar en cliente que todos los campos requeridos (título, tipo, género, año, duración y sinopsis) contengan información válida.
- Un usuario autenticado puede editar los datos de una obra existente desde su ficha técnica.
- Un usuario autenticado puede eliminar una obra existente solicitando confirmación previa antes de efectuar el borrado definitivo.
- Tras crear, editar o eliminar una obra, la aplicación debe notificar el resultado mediante un mensaje informativo y redirigir a la vista correspondiente.
- Los visitantes en modo lectura no deben visualizar los botones de creación, edición ni eliminación de obras.
- Si una obra solicitada por URL no existe, la aplicación debe mostrar una pantalla de error amigable con opción de regresar al catálogo.

### Fuera de alcance

- Listado, publicación y borrado de debates dentro del detalle de la obra (Iteración 14).
- Subida de archivos binarios o carátulas multimedia para las obras.

---

## PLAN

1. **Extensión de la Capa de Servicios (`src/services/workService.js`)**:
   - Completar las operaciones CRUD de obras:
     * `createWork(workData)`: envía `POST /api/works`.
     * `getWorkById(id)`: envía `GET /api/works/:id` y retorna la obra con sus metadatos.
     * `updateWork(id, workData)`: envía `PUT /api/works/:id`.
     * `deleteWork(id)`: envía `DELETE /api/works/:id`.

2. **Extensión del Store de Obras (`src/stores/works.js`)**:
   - Incorporar estado reactivo: `currentWork` e `isLoadingDetail`.
   - Incorporar acciones CRUD:
     * `fetchWorkById(id)`: obtiene el detalle de la obra y maneja estados 404.
     * `createWork(workData)`: invoca la creación en la API y retorna la obra creada.
     * `updateWork(id, workData)`: invoca la modificación y actualiza `currentWork`.
     * `deleteWork(id)`: invoca la eliminación y limpia la obra actual.

3. **Configuración de Servicios de Confirmación PrimeVue**:
   - Registrar `ConfirmationService` en `src/main.js`.
   - Añadir el componente global `<ConfirmDialog />` en `src/App.vue` para diálogos modales de confirmación accesibles.

4. **Vista de Ficha Técnica (`src/views/WorkDetailView.vue`)**:
   - Ruta `/works/:id`.
   - Presentación destacada con componentes PrimeVue (`Card`, `Tag`, `Button`):
     * Título principal, badge semántico de tipo con icono, género, año de estreno y duración.
     * Sinopsis completa.
     * Botones de gestión para usuarios autenticados: "Editar obra" y "Eliminar obra".
     * Ocultación de controles de edición y borrado para visitantes.
     * Diálogo de confirmación interactivo antes de ejecutar la eliminación (`useConfirm`).
     * Notificación flotante (`Toast`) ante éxito o error y redirección al catálogo.
     * Estado amigable para obras no encontradas (404) con enlace de retorno.
     * Sección inferior con marcador para los debates de la obra (Iteración 14).

5. **Vista de Formulario para Creación y Edición (`src/views/WorkFormView.vue`)**:
   - Rutas `/works/new` (creación) y `/works/:id/edit` (edición), protegidas con guardia de navegación para usuarios autenticados (`meta: { requiresAuth: true }`).
   - Formulario reactivo con componentes PrimeVue:
     * `InputText` para título.
     * `Select` para tipo de obra (`movie`, `series`, `book`).
     * `InputText` para género.
     * `InputText` para año de estreno (`release_year`).
     * `InputText` para duración (`duration`).
     * `Textarea` para sinopsis completa (`synopsis`).
   - Validación integral en cliente antes de enviar:
     * Comprobación de obligatoriedad en todos los campos.
     * Validación numérica y rango lógico para año de estreno.
     * Longitud mínima para título y sinopsis.
   - Botón de envío con indicador de carga (`loading`) y botón de cancelación.
   - En modo edición, precarga automática de los datos existentes.

6. **Integración en Navegación y Vistas**:
   - En `WorksListView.vue`, añadir botón "Crear Obra" visible para miembros autenticados.
   - En `router/index.js`, registrar rutas `/works/new`, `/works/:id` y `/works/:id/edit` con guardias de acceso.

7. **Pruebas automáticas (Vitest)**:
   - Tests de servicio para las operaciones CRUD (`workService.spec.js`).
   - Tests de store para `createWork`, `updateWork`, `deleteWork` y `fetchWorkById` (`works.spec.js`).
   - Tests de componente para `WorkDetailView.vue` (renderizado de ficha, control de botones según sesión, confirmación de borrado).
   - Tests de componente para `WorkFormView.vue` (validación de campos, modo creación y modo edición).
   - Verificación de la suite completa y compilación con `npm run build`.

### Decisiones relevantes

- Se utilizan rutas dedicadas `/works/new` y `/works/:id/edit` protegidas mediante el guardia `router.beforeEach` para que el flujo de creación y edición cuente con URLs navegables y limpias.
- La confirmación de eliminación se implementa a través de `ConfirmDialog` de PrimeVue, evitando el uso de alerts o confirms nativos del navegador para una experiencia estética y consistente.
- El control de permisos se aplica tanto a nivel visual (ocultando botones de edición y borrado a visitantes) como a nivel de rutas (bloqueando el acceso a formularios de alta y modificación sin sesión activa).

### Riesgos y dudas

- Asegurar que al eliminar una obra desde su vista de detalle, la navegación al catálogo refresque los registros sin mostrar la obra eliminada.

---

## TEST_PLAN

### Pruebas automáticas previstas

Se usan pruebas automáticas con `vitest` y `@vue/test-utils` para verificar las operaciones CRUD en la capa de servicios, el store y las vistas de detalle y formulario.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Crear obra en `workService` | Realiza `POST /works` con los datos y retorna la obra creada | OK (POST ejecutado y obra retornada) |
| Modificar obra en `workService` | Realiza `PUT /works/:id` y retorna la obra actualizada | OK (PUT ejecutado y cambios persistidos) |
| Eliminar obra en `workService` | Realiza `DELETE /works/:id` y confirma la eliminación | OK (DELETE ejecutado con mensaje de éxito) |
| Obtener detalle por ID en `useWorksStore` | Actualiza `currentWork` con los datos de la obra | OK (Obra cargada en estado reactivo) |
| Crear obra en `useWorksStore` | Envía datos a la API y actualiza el catálogo | OK (Obra creada y estado reactivo listo) |
| Modificar obra en `useWorksStore` | Actualiza la obra en el backend y refresca `currentWork` | OK (Obra actualizada y currentWork sincronizado) |
| Eliminar obra en `useWorksStore` | Elimina la obra del backend y limpia `currentWork` | OK (Obra eliminada del array y currentWork null) |
| Renderizar ficha técnica en `WorkDetailView` | Muestra título, tipo, género, año, duración y sinopsis íntegra | OK (Todos los campos visualizados en pantalla) |
| Ocultar acciones de edición/borrado a visitantes | Visitante no visualiza botones de modificar o eliminar en la ficha | OK (Botones de gestión ocultos sin sesión) |
| Mostrar acciones de edición/borrado a autenticados | Miembro autenticado visualiza botones de modificar y eliminar | OK (Botones editar y eliminar visibles con token) |
| Validar formulario de obra con campos vacíos | Bloquea envío y muestra mensajes de obligatoriedad en cada campo | OK (Validación bloquea submit y señala errores) |
| Pre-rellenar formulario en modo edición | Carga los datos de la obra existente en los inputs correspondientes | OK (Datos precargados en los inputs reactivos) |

### Tests automáticos previstos

- `frontend-vue/src/services/__tests__/workService.spec.js` (5 tests)
- `frontend-vue/src/stores/__tests__/works.spec.js` (10 tests)
- `frontend-vue/src/views/__tests__/WorkDetailView.spec.js` (4 tests)
- `frontend-vue/src/views/__tests__/WorkFormView.spec.js` (3 tests)
- `frontend-vue/src/views/__tests__/WorksListView.spec.js` (5 tests)
- `frontend-vue/src/components/__tests__/WorkCard.spec.js` (3 tests)
- `frontend-vue/src/components/__tests__/AppNavbar.spec.js` (3 tests)
- `frontend-vue/src/views/__tests__/LoginView.spec.js` (4 tests)
- `frontend-vue/src/stores/__tests__/auth.spec.js` (5 tests)
- `frontend-vue/src/services/__tests__/authService.spec.js` (4 tests)

Total acumulado en el frontend: **10 suites y 46 pruebas automáticas superadas con éxito (100%)**.

---

## AI_LOG

### Herramienta usada

- Herramienta: Antigravity
- Modelo: Gemini 3.8 Flash
- Tipo: asistente de desarrollo

### Uso realizado

Se usó la IA para:
- Estructurar la especificación (SPEC), plan (PLAN) y plan de pruebas (TEST_PLAN) de la iteración 13 para la ficha de detalle y el CRUD completo de obras.
- Extender `src/services/workService.js` con las funciones `createWork`, `getWorkById`, `updateWork` y `deleteWork`.
- Ampliar el store `useWorksStore` con `currentWork`, `isLoadingDetail` y las acciones de mutación y lectura individual.
- Integrar `ConfirmationService` y `<ConfirmDialog />` de PrimeVue para el flujo de borrado con confirmación modal.
- Desarrollar `WorkDetailView.vue` con control de permisos en interfaz (acciones protegidas para usuarios autenticados y ocultas para visitantes) y manejo de estados 404.
- Desarrollar `WorkFormView.vue` reutilizable para alta (`/works/new`) y edición (`/works/:id/edit`), con validaciones exhaustivas en cliente y precarga de datos.
- Proteger las rutas privadas mediante el guardia global `router.beforeEach` con redirección al login.
- Diseñar e implementar 14 nuevas pruebas unitarias y de integración de componentes, alcanzando 46 tests superados al 100%.
- Verificar la correcta compilación para producción con `npm run build`.

### Prompts importantes

- "ya tienes el archivo de la iteración 13 creado, plantea el spec y el plan para la ficha de detalle y el CRUD completo de obras"
- "el borrado de obras no puede ser accidental: integra el ConfirmDialog de PrimeVue para pedir confirmación modal destructiva antes de llamar a DELETE"
- "en la ficha de detalle, los botones de editar y eliminar solo deben ser visibles si el usuario ha iniciado sesión, si la obra no existe muestra error 404"
- "en los tests de WorkDetailView y WorkFormView da error No PrimeVue Toast/Confirm provided; añade ToastService y ConfirmationService en los plugins de test y un try/catch en el onMounted de WorkDetailView"
- "perfecto, implementa"

### Resultado

Implementación completa y validada de la ficha técnica de obras y del ciclo CRUD completo (creación, edición y borrado con confirmación PrimeVue), incluyendo control de permisos y validaciones estrictas. La suite completa alcanza 46 pruebas automáticas con 100% de éxito y el build de Vite se genera limpiamente.

### Decisión del estudiante

- Se acordó utilizar rutas dedicadas con URLs reales (`/works/new` y `/works/:id/edit`) protegidas con guardias de navegación (`router.beforeEach`) para la creación y edición.
- Se implementó la confirmación de borrado con `ConfirmDialog` de PrimeVue para evitar eliminaciones accidentales y mantener una estética unificada.
- Se mantuvieron los controles de edición y borrado ocultos para usuarios no autenticados en la ficha de detalle.
- Se optó por un único formulario polimórfico reactivo (`WorkFormView.vue`) capaz de operar en modo creación o edición según el parámetro `:id` de la ruta.

### Correcciones manuales

- Inclusión de los plugins `ToastService` y `ConfirmationService` en los plugins globales de test de `WorkDetailView.spec.js` y `WorkFormView.spec.js`.
- Captura de errores con bloque `try/catch` en `onMounted` de `WorkDetailView.vue` para gestionar obras no encontradas (404) sin dejar rechazos de promesa no controlados.

---

## COMMITS RELACIONADOS

- "93e6cc4595f52d29351dbb492ff55d890a15aced"
