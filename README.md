# Aplicación Web de Obras y Debates de Ficción

> **Asignatura**: Aplicaciones Distribuidas en Internet (AEDI)  
> **Práctica 4**: Desarrollo del frontend con un framework JavaScript  
> **Metodología**: Spec-Driven Development (SDD) con asistencia de IA  

---

## 1. Descripción del Proyecto

Esta plataforma web permite a los usuarios explorar, buscar, crear, editar y eliminar obras de ficción (películas, series, libros, etc.) así como gestionar debates comunitarios asociados a cada obra. 

El sistema consta de:
1. **Backend REST API**: Desarrollado en Node.js con Express, PostgreSQL / memoria y autenticación JWT.
2. **Frontend Principal (`/frontend-vue`)**: Desarrollado con **Vue 3** (Composition API `<script setup>`), **Vite**, **Vue Router 4**, **Pinia**, y la biblioteca de componentes **PrimeVue 4**.

---

## 2. Enlaces Rápidos a la Documentación SDD

Toda la documentación metodológica del proyecto se encuentra en el directorio [`docs/`](file:///c:/Users/ivans/Desktop/aedi-pract1/docs):
- [**`docs/ARCHITECTURE.md`**](file:///c:/Users/ivans/Desktop/aedi-pract1/docs/ARCHITECTURE.md): Arquitectura detallada del backend, base de datos y frontend (componentes, Pinia, router, servicios y flujo de datos).
- [**`docs/E2E_TEST_RUN.md`**](file:///c:/Users/ivans/Desktop/aedi-pract1/docs/E2E_TEST_RUN.md): Recorrido manual completo paso a paso con el backend real (matriz de comprobaciones, entradas y resultados obtenidos).
- [**`docs/AI_SUMMARY.md`**](file:///c:/Users/ivans/Desktop/aedi-pract1/docs/AI_SUMMARY.md): Registro acumulativo del uso, análisis crítico y validación de las propuestas de IA.
- [**`docs/iterations/`**](file:///c:/Users/ivans/Desktop/aedi-pract1/docs/iterations):
  - [Iteración 11: Setup Frontend, Axios y Autenticación con Pinia](file:///c:/Users/ivans/Desktop/aedi-pract1/docs/iterations/11-setupFrontendYAuth.md)
  - [Iteración 12: Catálogo de Obras, Búsqueda y Paginación Server-Side](file:///c:/Users/ivans/Desktop/aedi-pract1/docs/iterations/12-catalogoObrasYPaging.md)
  - [Iteración 13: Detalle de Obra, Creación, Edición y Confirmación de Borrado](file:///c:/Users/ivans/Desktop/aedi-pract1/docs/iterations/13-detalleYCrud.md)
  - [Iteración 14: Gestión del Recurso Secundario (Debates y Autoría)](file:///c:/Users/ivans/Desktop/aedi-pract1/docs/iterations/14-debatesFront.md)

---

## 3. Prerrequisitos

- **Node.js**: Versión 18.x o superior (`node -v`).
- **npm**: Versión 9.x o superior (`npm -v`).

---

## 4. Instalación y Ejecución

### 4.1. Arrancar el Backend (API REST)
El backend corre por defecto en el puerto **4000**.
```bash
# Entrar a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Iniciar el servidor
npm start
```
*El backend quedará escuchando en `http://localhost:4000/api`.*

### 4.2. Arrancar el Frontend Principal (Vue 3)
```bash
# En una nueva terminal, entrar al frontend de Vue
cd frontend-vue

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo Vite
npm run dev
```
*La aplicación web estará accesible en **`http://localhost:5173`**.*

---

## 5. Variables de Configuración

### Backend (`backend/.env`)
Existe una plantilla en `backend/.env.example`:
```env
PORT=4000
JWT_SECRET=dev-secret-change-me
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/aedi_fiction_db
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-clave-anon-o-service-role
```

### Frontend Vue (`frontend-vue/.env`)
Existe una plantilla en `frontend-vue/.env.example`:
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

---

## 6. Usuario de Prueba y Credenciales Demo

Para probar y repetir las verificaciones del sistema de forma inmediata, se dispone de las credenciales del usuario de prueba existente en la base de datos:

| Campo | Valor |
| :--- | :--- |
| **Email** | `ana@test.com` |
| **Contraseña** | `12345678` |
| **Nombre de usuario** | `ana` |

> Al iniciar sesión con este usuario, se habilitan las opciones para crear nuevas obras, editar obras existentes, eliminar obras (con diálogo modal destructivo de confirmación) y publicar o borrar debates propios.

---

## 7. Ejecución de Pruebas

### 7.1. Pruebas Automatizadas del Frontend (Vitest)
El proyecto cuenta con **62 pruebas unitarias y de integración** distribuidas en 14 suites que cubren componentes, vistas, stores de Pinia y servicios API:
```bash
cd frontend-vue
npm test
```
*Resultado: **14/14 test suites superadas, 62/62 tests pasando (100%)**.*

Para ejecutar con cobertura o en modo UI:
```bash
npm run test:run
```

### 7.2. Pruebas Automatizadas del Backend
```bash
cd backend
npm test
```

### 7.3. Pruebas Manuales End-to-End con Backend Real
El recorrido completo del flujo funcional (Login -> Crear Obra -> Localizar en catálogo con búsqueda y paginación -> Consultar detalle -> Crear debate -> Eliminar debate -> Editar obra -> Eliminar obra con confirmación -> Logout) está documentado paso a paso con tabla de resultados en [**`docs/E2E_TEST_RUN.md`**](file:///c:/Users/ivans/Desktop/aedi-pract1/docs/E2E_TEST_RUN.md).

---

## 8. Relación de Apartados Adicionales Implementados (+2,0 Puntos)

La aplicación cubre los cuatro apartados adicionales principales propuestos en la rúbrica oficial de la práctica (hasta 2 puntos):

| Apartado Adicional | Puntuación | Detalle de Implementación |
| :--- | :---: | :--- |
| **Búsqueda integrada con la paginación** | **+0,5 pt** | Implementado en `WorksFilterBar.vue` y `works.js`. La búsqueda envía los criterios al backend (`GET /api/works?search=...&page=...&limit=...`) con debounce de 300 ms, sincroniza la paginación a la página 1 ante cada búsqueda, muestra estados de sin resultados y botón para restablecer filtros. |
| **Navegación mediante un router** | **+0,5 pt** | Implementado en `src/router/index.js` con **Vue Router 4** en modo HTML5 History (`/`, `/works`, `/works/new`, `/works/:id`, `/works/:id/edit`, `/login`). Soporta navegación atrás/adelante coherente, URLs amigables y guardia global de navegación (`router.beforeEach`) con redirección segura `?redirect=...`. |
| **Biblioteca de componentes UI** | **+0,5 pt** | Integración transversal de **PrimeVue 4** con preset **Aura** y **PrimeIcons**. Uso de `DataTable`, `Card`, `Tag`, `Button`, `InputText`, `Select`, `Paginator`, `ProgressBar`, `Toast` (con `ToastService`) y `ConfirmDialog` (con `ConfirmationService`). |
| **Gestión de un recurso secundario** | **+0,5 pt** | Implementado en `WorkDebatesSection.vue`, `DebateCard.vue` y `debates.js`. Permite listar debates asociados a una obra, crear debates con validación y eliminarlos con confirmación. Incorpora **regla estricta de autoría**: únicamente el creador del debate visualiza el botón de borrado (`authStore.user.id === debate.user_id`). |

---

## 9. Limitaciones Conocidas

1. **Registro de usuarios y edición de perfil en frontend**: El backend dispone de los endpoints correspondientes (`POST /api/auth/register`, etc.), pero la interfaz del frontend se ha centrado en el flujo de inicio de sesión con usuarios existentes, como permite explícitamente el enunciado.
2. **Mensajería privada en tiempo real**: Los mensajes directos y notificaciones en tiempo real vía Supabase Realtime forman parte de la arquitectura base del backend desarrollada en la práctica 1 y se reservan para etapas posteriores de integración completa.

