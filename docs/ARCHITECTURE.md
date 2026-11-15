# ARCHITECTURE

## Backend

- **API REST (Node.js con Express)**:
  - Manejo de la lógica de negocio central y operaciones CRUD para obras, debates y comentarios.
  - Gestión de relaciones entre usuarios (contactos/amigos y usuarios bloqueados).
  - Autenticación mediante tokens JWT (o validación de sesiones/tokens de Supabase Auth).
- **Supabase**:
  - **Base de datos (PostgreSQL)**: Almacenamiento unificado de datos compartidos entre la API y Supabase.
  - **Supabase Realtime**: Gestión del chat privado instantáneo uno a uno mediante suscripciones a eventos de inserción en tiempo real.
  - **Sistema de notificaciones**: Eventos y canales en tiempo real para alertar de nuevos comentarios en debates seguidos.

## Frontend (Vue 3 + PrimeVue)

El frontend principal de la aplicación está desarrollado con **Vue 3** utilizando la **Composition API** (`<script setup>`) y empaquetado con **Vite**. Se conecta a la API REST de Node.js/Express mediante un cliente centralizado de **Axios**, gestiona el estado compartido reactivo con **Pinia**, estructura la navegación mediante **Vue Router 4** (modo HTML5 History con guardias de navegación), y ofrece una interfaz moderna y accesible utilizando la biblioteca de componentes **PrimeVue 4** con el tema **Aura**.

### 1. Tecnologías y librerías clave
- **Framework principal**: Vue 3 (`vue ^3.5.12`) con sintaxis reactiva moderna (`ref`, `reactive`, `computed`, `watch`, `onMounted`).
- **Tooling y Bundler**: Vite (`vite ^5.4.9`) con plugin oficial `@vitejs/plugin-vue`.
- **Enrutador**: Vue Router 4 (`vue-router ^4.4.5`) en modo HTML5 History (`createWebHistory`) con guardias de navegación (`router.beforeEach`).
- **Gestión de Estado Compartido**: Pinia (`pinia ^2.2.4`) con stores modulares y persistencia en `localStorage`.
- **Biblioteca de Componentes UI**: PrimeVue 4 (`primevue ^4.1.1`) configurado con preset Aura (`@primevue/themes/aura`), iconos PrimeIcons (`primeicons ^7.0.0`) y servicios de utilidad (`ToastService`, `ConfirmationService`).
- **Cliente HTTP**: Axios (`axios ^1.7.7`) con interceptores para inyección automática de tokens de autenticación `Bearer <jwt>`.
- **Testing**: Vitest (`vitest ^3.2.7`), `@vue/test-utils ^2.4.6` y `jsdom ^26.1.0`.

### 2. Separación de Responsabilidades y Organización

La arquitectura del frontend desacopla estrictamente la capa de presentación, la gestión de estado y el acceso a la API:

1. **Capa de Servicios (`src/services/`)**:
   - `api.js`: Instancia centralizada de Axios con `baseURL: 'http://localhost:4000/api'`. Contiene interceptores de petición que adjuntan automáticamente la cabecera `Authorization: Bearer <token>` cuando existe un token almacenado en `localStorage`.
   - `authService.js`: Funciones para autenticación (`login`, `register`, `getMe`).
   - `workService.js`: Funciones CRUD y búsqueda/paginación de obras (`getWorks`, `getWorkById`, `createWork`, `updateWork`, `deleteWork`).
   - `debateService.js`: Funciones para el recurso secundario (`getDebatesByWork`, `createDebate`, `deleteDebate`).

2. **Capa de Estado Compartido - Pinia Stores (`src/stores/`)**:
   - `auth.js`: Almacena el usuario autenticado (`user`), el token JWT (`token`), y el estado de autenticación (`isAuthenticated`). Persiste la sesión en `localStorage` (`auth_token` y `auth_user`) y proporciona acciones `login()`, `logout()` (limpiando almacenamiento y estado reactivo) e `initAuth()` al arrancar la app.
   - `works.js`: Gestiona el catálogo de obras, estado de carga (`loading`), errores (`error`), paginación del servidor (`pagination: { page, limit, total, totalPages }`), filtros activos (`filters: { search, type, genre, year }`) y la obra activa seleccionada (`currentWork`). Centraliza las llamadas a `workService` y la sincronización reactiva tras mutaciones.
   - `debates.js`: Gestiona los debates asociados a una obra (`debates`), estados asíncronos (`loading`, `error`, `actionLoading`) y acciones `fetchDebatesByWork()`, `createDebate()`, `deleteDebate()`.

3. **Capa de Enrutamiento y Navegación (`src/router/`)**:
   - Define el mapa de rutas mediante `createRouter` con historial web HTML5.
   - Rutas configuradas:
     - `/` -> `HomeView.vue` (Pública: bienvenida e información de la plataforma).
     - `/works` -> `WorksListView.vue` (Pública: catálogo con búsqueda server-side y paginación).
     - `/works/new` -> `WorkFormView.vue` (Protegida: creación de obras).
     - `/works/:id` -> `WorkDetailView.vue` (Pública: ficha técnica y debates).
     - `/works/:id/edit` -> `WorkFormView.vue` (Protegida: edición de obras).
     - `/login` -> `LoginView.vue` (Pública: inicio de sesión).
   - Guardia global `router.beforeEach`: evalúa el metadato `meta.requiresAuth`. Si el usuario no está autenticado, redirige a `/login` preservando la ruta de destino mediante el parámetro de consulta `?redirect=...`.

4. **Capa de Vistas de Página (`src/views/`)**:
   - `HomeView.vue`: Portada explicativa del catálogo de ficción y acceso rápido a obras.
   - `LoginView.vue`: Formulario de inicio de sesión con validación de credenciales en cliente, soporte para tecla Enter, estados de carga y feedback de error.
   - `WorksListView.vue`: Vista principal del catálogo que coordina la búsqueda reactiva, selectores de filtrado (tipo, género, año), grid de tarjetas `WorkCard`, indicador de carga `ProgressBar`, vista de lista vacía, mensaje de error con botón de reintento y paginador `Paginator` de PrimeVue conectado al servidor.
   - `WorkDetailView.vue`: Detalle de la obra seleccionada con sinopsis completa, ficha técnica, botones de edición y borrado protegidos con `ConfirmDialog` de PrimeVue (con confirmación modal destructiva), y la sección integrada de debates (`WorkDebatesSection`).
   - `WorkFormView.vue`: Vista reactiva polimórfica (creación o edición según el parámetro `:id` de la ruta). Realiza validación reactiva de campos obligatorios, rangos de año y duración, confirmación visual con `Toast` de PrimeVue y cancelación segura con retorno a la vista previa.

5. **Capa de Componentes Reutilizables (`src/components/`)**:
   - `AppNavbar.vue`: Barra de navegación responsive con menú hamburguesa, badge del usuario logueado, botón de logout y enlaces sincronizados con el estado de autenticación.
   - `WorkCard.vue`: Tarjeta estilizada con `Card` de PrimeVue, badges semánticos por tipo de obra (`Tag`) y acceso directo al detalle.
   - `WorksFilterBar.vue`: Barra de filtrado con `IconField`, `InputIcon`, `InputText` y selectores `Select` de PrimeVue, emitiendo eventos reactivos con debounce.
   - `DebateCard.vue`: Tarjeta individual de debate que aplica la regla de negocio de **autoría**: el botón de eliminar únicamente se muestra si el usuario logueado es el autor (`authStore.user?.id === debate.user_id`).
   - `WorkDebatesSection.vue`: Componente autónomo para el recurso secundario dentro del detalle de obra: formulario de creación para usuarios autenticados, aviso de inicio de sesión para invitados, listado de debates, estados de carga y confirmación de borrado.

### 3. Diagrama de Flujo de Datos

```text
[ Usuario ]
    │
    ▼ (Interacción / Click / Formulario)
[ Vista / Componente Vue 3 ] (p.ej. WorksListView, WorkFormView)
    │
    ▼ (Invoca acción reactiva)
[ Pinia Store ] (p.ej. worksStore, authStore, debatesStore)
    │
    ▼ (Llamada asíncrona)
[ Servicio API ] (p.ej. workService, authService, debateService)
    │
    ▼ (Petición HTTP + Bearer Token)
[ Axios Client (api.js) ]
    │
    ▼ HTTP GET/POST/PUT/DELETE
[ Backend API REST Express ] (http://localhost:4000/api)
    │
    ▼ Consulta SQL
[ Base de Datos PostgreSQL / In-Memory ]
```

---

## Tablas de la Base de Datos

### users
- `id` (UUID, Primary Key)
- `username` (VARCHAR, Unique)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `avatar_url` (VARCHAR)
- `bio` (TEXT)
- `created_at` (TIMESTAMP)

### works (Obras)
- `id` (UUID, Primary Key)
- `title` (VARCHAR)
- `type` (VARCHAR - Ej: 'movie', 'book', 'series')
- `genre` (VARCHAR)
- `release_year` (INTEGER)
- `duration` (VARCHAR / INTEGER - Minutos, páginas o temporadas)
- `synopsis` (TEXT)
- `created_at` (TIMESTAMP)

### debates
- `id` (UUID, Primary Key)
- `work_id` (UUID, Foreign Key -> `works.id`)
- `user_id` (UUID, Foreign Key -> `users.id`)
- `title` (VARCHAR)
- `description` (TEXT)
- `created_at` (TIMESTAMP)

### debate_comments
- `id` (UUID, Primary Key)
- `debate_id` (UUID, Foreign Key -> `debates.id`)
- `user_id` (UUID, Foreign Key -> `users.id`)
- `content` (TEXT)
- `created_at` (TIMESTAMP)

### debate_subscriptions (Notificaciones de debates)
- `id` (UUID, Primary Key)
- `debate_id` (UUID, Foreign Key -> `debates.id`)
- `user_id` (UUID, Foreign Key -> `users.id`)
- `created_at` (TIMESTAMP)

### user_relationships (Amigos y Bloqueos)
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `users.id`)
- `target_user_id` (UUID, Foreign Key -> `users.id`)
- `type` (VARCHAR - 'friend' | 'blocked')
- `created_at` (TIMESTAMP)

### direct_messages (Chat privado en tiempo real - Supabase)
- `id` (UUID, Primary Key)
- `sender_id` (UUID, Foreign Key -> `users.id`)
- `receiver_id` (UUID, Foreign Key -> `users.id`)
- `content` (TEXT)
- `read` (BOOLEAN, default: false)
- `created_at` (TIMESTAMP)

### notifications (Alertas para usuarios)
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `users.id`)
- `debate_id` (UUID, Foreign Key -> `debates.id`)
- `comment_id` (UUID, Foreign Key -> `debate_comments.id`)
- `is_read` (BOOLEAN, default: false)
- `created_at` (TIMESTAMP)

---

## Rutas principales de la API REST

### Autenticación y Usuarios
- `POST /api/auth/register` — Registro de nuevo usuario.
- `POST /api/auth/login` — Inicio de sesión y obtención de token.
- `GET /api/users` — Búsqueda de perfiles de usuario.
- `GET /api/users/:id` — Detalle del perfil de un usuario.
- `POST /api/users/:id/relationships` — Agregar contacto o bloquear usuario (`{ type: "friend" | "blocked" }`).
- `DELETE /api/users/:id/relationships` — Eliminar contacto o desbloquear usuario.

### Obras
- `GET /api/works` — Búsqueda y filtrado de obras (por tipo, género, año, título...) con paginación server-side.
- `GET /api/works/:id` — Ficha técnica de la obra y debates asociados.
- `POST /api/works` — Crear nueva obra en el catálogo (requiere token).
- `PUT /api/works/:id` — Modificar una obra existente (requiere token).
- `DELETE /api/works/:id` — Eliminar una obra existente (requiere token).

### Debates y Comentarios
- `GET /api/debates` — Listado y búsqueda global de debates.
- `POST /api/works/:workId/debates` — Crear debate para una obra (requiere token).
- `GET /api/debates/:id` — Ver detalle de un debate y sus comentarios.
- `DELETE /api/debates/:id` — Eliminar un debate propio (requiere autoría y token).
- `POST /api/debates/:id/comments` — Añadir nuevo comentario a un debate.
- `POST /api/debates/:id/subscribe` — Activar/desactivar notificaciones de un debate.

---

## Estructura del repositorio

```text
├── backend/                 # API REST Node.js + Express
│   ├── src/
│   │   ├── config/          # Variables de entorno y conexión con base de datos
│   │   ├── controllers/     # Controladores de las rutas REST
│   │   ├── middlewares/     # Middlewares de autenticación JWT y validación
│   │   ├── models/          # Modelos de datos y consultas SQL
│   │   ├── routes/          # Definición de rutas Express
│   │   ├── services/        # Lógica de negocio
│   │   └── app.js           # Configuración de Express, CORS y middlewares
│   ├── tests/               # Pruebas automatizadas del backend (node --test)
│   ├── package.json
│   └── server.js            # Punto de entrada del servidor (puerto 4000)
├── frontend-vue/            # Frontend principal (Vue 3 + PrimeVue)
│   ├── src/
│   │   ├── assets/          # Estilos globales y temas
│   │   ├── components/      # Componentes UI (Navbar, Card, FilterBar, Debates...)
│   │   ├── router/          # Configuración de Vue Router y guardias de autenticación
│   │   ├── services/        # Cliente Axios y servicios de API (auth, works, debates)
│   │   ├── stores/          # Stores reactivos de Pinia (auth, works, debates)
│   │   ├── views/           # Vistas principales (Home, Login, List, Detail, Form)
│   │   ├── App.vue          # Componente raíz con RouterView, Toast y ConfirmDialog
│   │   └── main.js          # Inicialización de Vue, Pinia, PrimeVue y Router
│   ├── tests/               # Suites de pruebas con Vitest (62 tests unitarios e integración)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docs/                    # Documentación de la metodología SDD
│   ├── iterations/          # Iteraciones 11 a 14 (SPEC, PLAN, TEST_PLAN, AI_LOG, COMMITS)
│   ├── ARCHITECTURE.md      # Arquitectura global backend y frontend
│   ├── PROJECT_SPEC.md      # Especificación general del proyecto
│   ├── AI_SUMMARY.md        # Registro acumulado del uso de IA
│   └── E2E_TEST_RUN.md      # Guía de comprobación y ejecución del flujo E2E real
└── README.md                # Instrucciones de arranque, tests, credenciales y rúbrica
```
