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

## Frontend

- **Por determinar** (se definirá más adelante en el proyecto).
- Consumirá los endpoints HTTP de la API REST para operaciones habituales y mantendrá una conexión por WebSockets con el cliente de Supabase para el chat en vivo y las notificaciones.

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
- `GET /api/works` — Búsqueda y filtrado de obras (por tipo, género, año, título...).
- `GET /api/works/:id` — Ficha técnica de la obra y debates asociados.
- `POST /api/works` — Crear nueva obra en el catálogo.

### Debates y Comentarios
- `GET /api/debates` — Listado y búsqueda global de debates.
- `POST /api/works/:workId/debates` — Crear debate para una obra.
- `GET /api/debates/:id` — Ver detalle de un debate y sus comentarios.
- `POST /api/debates/:id/comments` — Añadir nuevo comentario a un debate.
- `POST /api/debates/:id/subscribe` — Activar/desactivar notificaciones de un debate.

---

## Estructura de carpetas propuesta

```text
├── backend/
│   ├── src/
│   │   ├── config/          # Variables de entorno y conexión con base de datos/Supabase
│   │   ├── controllers/     # Controladores de las rutas REST
│   │   ├── middlewares/     # Middleware de autenticación JWT, validación y control de bloqueos
│   │   ├── models/          # Modelos de datos / consultas SQL
│   │   ├── routes/          # Definición de rutas Express
│   │   ├── services/        # Lógica de negocio (notificaciones, relaciones, etc.)
│   │   └── app.js           # Inicialización de Express y configuración de middlewares
│   ├── package.json
│   └── server.js            # Punto de entrada del servidor
├── frontend/                # Por determinar
├── docs/
│   ├── PROJECT_SPEC.md
│   └── ARCHITECTURE.md
└── README.md
