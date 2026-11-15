# Iteración 11 - Setup del frontend y autenticación

## SPEC

### Objetivo

Inicializar la aplicación frontend con su navegación base e implementar el flujo de inicio y cierre de sesión para que los usuarios puedan identificarse y mantener su sesión activa en la plataforma.

### Requisitos

- Un visitante puede acceder a la pantalla de inicio de sesión desde la barra de navegación.
- Un usuario puede iniciar sesión introduciendo su correo electrónico y contraseña.
- No se permite enviar el formulario con campos vacíos o con un formato de correo inválido.
- Si las credenciales son incorrectas, la aplicación debe mostrar un mensaje de error claro al usuario.
- Si las credenciales son correctas, el usuario queda autenticado, se guarda su sesión y es redirigido a la página principal.
- La barra de navegación debe mostrar el estado actual de la sesión (nombre del usuario si está conectado o botón de acceso si es visitante).
- Un usuario autenticado puede cerrar sesión en cualquier momento, limpiando sus datos y volviendo al estado de visitante.
- Si un usuario ya ha iniciado sesión, no debe poder volver a la pantalla de login.
- La sesión debe mantenerse activa si el usuario recarga la página en el navegador.
- La pantalla de login debe incluir una ayuda visual con credenciales de prueba para facilitar las comprobaciones.

### Fuera de alcance

- Registro de nuevos usuarios desde el formulario.
- Recuperación o cambio de contraseña.
- Listado y gestión de obras o debates (se abordarán en las siguientes iteraciones).

---

## PLAN

1. **Inicialización del frontend en `/frontend-vue`**:
   - Crear la aplicación con Vite y Vue 3 (`<script setup>`).
   - Instalar dependencias esenciales: `vue`, `vue-router`, `pinia`, `primevue`, `@primevue/themes`, `primeicons` y `axios`.
   - Configurar dependencias de desarrollo y test: `vitest`, `@vue/test-utils`, `jsdom`.
   - Definir variables de entorno en `.env` (`VITE_API_BASE_URL=http://localhost:4000/api`).

2. **Configuración de PrimeVue y estilos base**:
   - Registrar PrimeVue con el preset temático Aura y el servicio `ToastService` en `src/main.js`.
   - Importar estilos globales de PrimeIcons y estilos base de la aplicación.

3. **Capa de servicios HTTP (`src/services/`)**:
   - Crear `src/services/api.js` configurando una instancia de Axios con la URL base del backend e interceptores:
     * Interceptor de petición para adjuntar `Authorization: Bearer <token>` cuando exista sesión.
     * Interceptor de respuesta para gestionar errores HTTP globales y capturar 401.
   - Crear `src/services/authService.js` con métodos desacoplados:
     * `login({ email, password })` invocando `POST /api/auth/login`.
     * `getProfile()` invocando `GET /api/auth/me`.

4. **Gestión de estado global con Pinia (`src/stores/auth.js`)**:
   - Crear el store `useAuthStore` con estado reactivo (`user`, `token`, `isAuthenticated`, `isLoading`, `errorMessage`).
   - Implementar acciones:
     * `login(credentials)`: llamada al servicio, almacenamiento del token y perfil en estado y `localStorage`.
     * `logout()`: limpieza de estado y de `localStorage`.
     * `initializeAuth()`: restauración automática de la sesión al recargar la página.

5. **Configuración de Vue Router (`src/router/index.js`)**:
   - Declarar rutas `/` (`HomeView.vue`), `/login` (`LoginView.vue`) y ruta comodín 404.
   - Implementar guardia de navegación global (`beforeEach`):
     * Redirigir a `/` a los usuarios ya autenticados que intenten acceder a `/login`.

6. **Barra de navegación global (`src/components/AppNavbar.vue`)**:
   - Barra superior responsiva con el nombre de la app y enlaces principales.
   - Visualización condicional reactiva:
     * Visitante: botón de enlace a `/login`.
     * Autenticado: nombre del usuario conectado y botón de cerrar sesión (`Logout`) con confirmación y toast.

7. **Pantalla de Login (`src/views/LoginView.vue`)**:
   - Diseño con `Card` de PrimeVue centrado en pantalla.
   - Formulario reactivo con `InputText` (email), `Password` (contraseña) y `Button`.
   - Validación en cliente (campos obligatorios y formato de email).
   - Indicador visual de carga durante la petición (`loading`).
   - Notificaciones contextuales con `Toast` ante éxito o error de credenciales.
   - Cuadro informativo con credenciales de prueba (`ana@test.com` / `12345678`) con botón para autorellenar.

8. **Pruebas automáticas y verificación**:
   - Crear pruebas unitarias con Vitest para validar:
     * Store de autenticación (`authStore`): login exitoso, login con credenciales erróneas, logout y persistencia en `localStorage`.
     * Servicio de autenticación (`authService`) e interceptores de red.
     * Renderizado y validaciones del formulario de login (`LoginView.vue`).
     * Comportamiento condicional de la barra de navegación (`AppNavbar.vue`).
   - Ejecutar la suite de tests del frontend (`npm run test`) y el build de producción (`npm run build`).

### Decisiones relevantes

- Se utiliza PrimeVue 4 junto con su preset temático Aura (`@primevue/themes/aura`) para disponer de una interfaz limpia, accesible y uniforme en toda la app sin CSS manual redundante.
- El token y perfil básico se persisten en `localStorage` bajo las claves `auth_token` y `auth_user` para que la experiencia de usuario no se interrumpa al refrescar la ventana.
- Toda llamada HTTP se encapsula en `src/services/`, garantizando que las vistas y componentes no tengan acoplamiento con la API ni con bibliotecas de transporte HTTP.

### Riesgos y dudas

- Asegurar que la configuración de Vite permita resolver alias (`@/` a `src/`) y ejecutar las pruebas de Vitest sin problemas en el entorno de Node.js.

---

## TEST_PLAN

### Pruebas automáticas previstas

Se usan pruebas automáticas con `vitest` y `@vue/test-utils` para verificar la lógica del store de autenticación, la capa de servicios, las validaciones de formulario y la barra de navegación.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Inicializar authStore sin token previo | Sesión inactiva (`user=null`, `token=null`, `isAuthenticated=false`) | OK (Sesión inactiva y estado limpio) |
| Restaurar sesión previa desde `localStorage` | Sesión restaurada con datos de usuario y token válido | OK (Sesión y perfil restaurados correctamente) |
| Login exitoso en authStore | Guarda token y usuario, activa sesión y limpia errores previos | OK (Token persistido y sesión activa) |
| Login con credenciales incorrectas en authStore | Captura error 401, mantiene sesión inactiva y almacena mensaje de error | OK (Error 401 capturado y sesión inactiva) |
| Logout en authStore | Elimina token y usuario de la reactividad y de `localStorage` | OK (Estado y almacenamiento local limpios) |
| Inyección de cabecera de autenticación en cliente API | Cliente HTTP añade `Authorization: Bearer <token>` cuando hay sesión | OK (Cabecera Authorization añadida correctamente) |
| Interceptor API sin token en localStorage | Peticiones no incluyen cabecera Authorization innecesaria | OK (Cabecera Authorization no presente) |
| Validar formulario de login con campos vacíos | Mensajes de campo obligatorio para email y contraseña sin enviar petición | OK (Validación bloquea envío y muestra avisos) |
| Validar formato inválido de correo en login | Mensaje de advertencia de formato de email no válido | OK (Validación de formato de email activa) |
| Autocompletar credenciales de prueba en login | Rellena formulario con `ana@test.com` y `12345678` | OK (Formulario autorellenado correctamente) |
| Barra de navegación en modo visitante | Muestra botón de Iniciar sesión y oculta controles de usuario | OK (Botón de login visible) |
| Barra de navegación con usuario autenticado | Muestra nombre del usuario y botón de Cerrar sesión | OK (Nombre de usuario y logout visibles) |
| Cerrar sesión desde la barra de navegación | Ejecuta logout, limpia estado y redirige al usuario | OK (Logout y redirección a login completados) |

### Tests automáticos previstos

- `frontend-vue/src/stores/__tests__/auth.spec.js` (5 tests)
- `frontend-vue/src/services/__tests__/authService.spec.js` (4 tests)
- `frontend-vue/src/views/__tests__/LoginView.spec.js` (4 tests)
- `frontend-vue/src/components/__tests__/AppNavbar.spec.js` (3 tests)

Total de pruebas ejecutadas: **16 superadas con éxito (100%)**.

---

## AI_LOG

### Herramienta usada

- Herramienta: Antigravity
- Modelo: Gemini 3.8 Flash
- Tipo: asistente de desarrollo

### Uso realizado

Se usó la IA para:
- Estructurar la especificación (SPEC), plan (PLAN) y plan de pruebas (TEST_PLAN) de la iteración 11 en lenguaje claro y alineado con los estándares del proyecto.
- Configurar la estructura de `/frontend-vue` con Vite, Vue 3 (Composition API con `<script setup>`), Vue Router, Pinia, PrimeVue (tema Aura + PrimeIcons + ToastService) y Axios.
- Implementar la capa desacoplada de servicios HTTP en `src/services/api.js` y `src/services/authService.js` con interceptores para inyección de token Bearer y control de errores 401.
- Desarrollar el store reactivo de autenticación `useAuthStore` con persistencia en `localStorage`.
- Diseñar la barra de navegación reactiva `AppNavbar.vue` con estados dinámicos para visitante y usuario autenticado.
- Construir la vista de `LoginView.vue` con validaciones en cliente, feedback mediante PrimeVue Toast/Message y panel de ayuda con credenciales de prueba.
- Configurar y ejecutar la batería completa de pruebas automáticas con Vitest y `@vue/test-utils` (16 pruebas con 100% de éxito).
- Compilar el proyecto para producción (`npm run build`) verificando la ausencia de errores de empaquetado.

### Prompts importantes

- "vamos a empezar con el frontend de la práctica 4; estructúralo en 4 iteraciones (11 a 14) para separar auth, catálogo/paginación, CRUD de obras y recurso secundario (debates)"
- "te he creado el documento de la iteración 11 con el spec; para la interfaz usaremos PrimeVue 4 con tema Aura y PrimeIcons, y la sesión se gestionará con Pinia guardando el token y usuario en localStorage"
- "revisa el spec y plantea el plan de implementación y el plan de pruebas unitarias y de componentes"
- "comienza con la implementación"

### Resultado

Implementación completa, compilada y validada de la base del frontend y del flujo de autenticación (Login/Logout). Se han superado las 16 pruebas unitarias y de integración de componentes, y el build de Vite para producción se genera limpiamente.

### Decisión del estudiante

- Se decidió estructurar el desarrollo del frontend de la práctica en 4 iteraciones temáticas (11 a 14) para abordar de forma ordenada la autenticación, el catálogo/búsqueda/paginación, el CRUD de obras y la gestión de debates.
- Se eligió PrimeVue 4 con tema Aura y PrimeIcons para mantener una interfaz accesible, estética y coherente en toda la aplicación.
- Se estableció la persistencia de sesión en `localStorage` mediante las claves `auth_token` y `auth_user`.
- Se optó por una barra de navegación reactiva (`AppNavbar.vue`) que cambia dinámicamente según el estado de autenticación del usuario.

### Correcciones manuales

- Inclusión de stubs y configuración de plugins de PrimeVue en el entorno de pruebas de Vitest (`@vue/test-utils`) para simular adecuadamente los componentes en entorno jsdom.
- Ajuste de los mensajes de error en el formulario de login para asegurar que los fallos 401 de credenciales se muestren de forma clara en la interfaz.

---

## COMMITS RELACIONADOS

- "118342e6e975ac11616fb032f78ab0adae8a4d39"
