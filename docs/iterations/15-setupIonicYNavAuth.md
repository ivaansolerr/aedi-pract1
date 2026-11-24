# Iteración 15 - Setup Ionic y Navegación con Auth guards

## SPEC

### Objetivo

Inicializar la aplicación móvil con su navegación base e implementar el flujo de inicio y cierre de sesión, adaptando la experiencia a dispositivos móviles para que los usuarios puedan identificarse, interactuar mediante formularios táctiles y mantener su sesión segura y activa.

### Requisitos

- Un visitante puede acceder a la pantalla de inicio de sesión desde la barra superior de la aplicación.
- Un usuario puede iniciar sesión introduciendo su correo electrónico y contraseña.
- El formulario debe estar adaptado a teclados móviles (teclado de correo electrónico para el email y ocultación de caracteres para la contraseña).
- No se permite enviar el formulario con campos vacíos o con un formato de correo inválido, mostrando avisos de validación claros junto a cada campo.
- Si las credenciales son incorrectas, la aplicación debe mostrar una notificación de error clara al usuario.
- Si las credenciales son correctas, el usuario queda autenticado, se guarda su sesión, se muestra una notificación de bienvenida y es redirigido a la pantalla principal.
- La barra superior debe mostrar el estado actual de la sesión (nombre del usuario si está conectado o botón de acceso si es visitante).
- Un usuario autenticado puede cerrar sesión en cualquier momento, limpiando sus credenciales y volviendo al estado de visitante.
- Al cerrar sesión, la aplicación debe impedir volver a pantallas privadas mediante el botón de retroceso.
- Si un usuario ya ha iniciado sesión, no debe poder volver a la pantalla de login.
- La sesión debe mantenerse activa si el usuario recarga la aplicación.
- La pantalla de login debe incluir una ayuda visual con credenciales de prueba para facilitar las comprobaciones.

### Fuera de alcance

- Exploración del catálogo de obras, búsqueda y filtros.
- Creación, modificación o eliminación de obras.
- Visualización y gestión de debates o comentarios.
- Registro de nuevos usuarios desde el formulario o recuperación de contraseña.

---

## PLAN

1. **Configuración del entorno base en `/frontend-ionic`**:
   - Instalar las dependencias esenciales compartidas: `pinia` y `axios`.
   - Crear archivo de variables de entorno `.env` con `VITE_API_BASE_URL=http://localhost:4000/api`.
   - Registrar la instancia de Pinia en `src/main.ts` y llamar a `initializeAuth()` antes de montar la app.

2. **Reutilización de servicios y estado compartido**:
   - Reutilizar `src/services/api.js` con el interceptor de Axios para inyección del `Bearer token` y control de error 401.
   - Reutilizar `src/services/authService.js` con los métodos desacoplados de autenticación (`login`, `getProfile`).
   - Reutilizar `src/stores/auth.js` (`useAuthStore`) manteniendo el estado reactivo (`token`, `user`, `isAuthenticated`, `isLoading`, `errorMessage`) y persistencia en `localStorage`.

3. **Configuración de navegación móvil (`src/router/index.ts`)**:
   - Configurar `@ionic/vue-router` con `<ion-router-outlet>`.
   - Definir rutas `/login` y `/home`.
   - Implementar guardia `router.beforeEach`:
     * Bloquear acceso a `/login` a usuarios ya autenticados.
     * Redirigir a `/login` si se intenta acceder a una ruta con `meta.requiresAuth` sin sesión activa.
   - Asegurar navegación con `replace` al cerrar sesión para garantizar la coherencia de la pila móvil.

4. **Desarrollo de la pantalla de autenticación móvil (`src/views/LoginPage.vue`)**:
   - Construir la vista utilizando componentes de Ionic: `<ion-page>`, `<ion-header>`, `<ion-toolbar>`, `<ion-title>`, `<ion-content>`, `<ion-card>`, `<ion-list>`, `<ion-item>`.
   - Integrar `<ion-input>` con `type="email"`, `inputmode="email"`, `clear-input="true"`, y contraseña con `type="password"`.
   - Validación reactiva con mensajes de advertencia `<ion-note color="danger">` colocados inmediatamente debajo de cada campo.
   - Feedback de resultados mediante `toastController` de Ionic con mensajes contextuales y temporizador de cierre.
   - Botón interactivo de relleno rápido con credenciales de prueba (`ana@test.com` / `12345678`).

5. **Cabecera global y control de sesión en vista principal (`src/views/HomePage.vue`)**:
   - Barra superior móvil con título, botón de acceso si es visitante, o badge con nombre y botón de desconexión si está autenticado.
   - Flujo de desconexión seguro con redirección a `/login`.

6. **Pruebas automáticas y verificación**:
   - Crear pruebas unitarias con Vitest y `@vue/test-utils` en `frontend-ionic/tests/unit/`:
     * Pruebas del store de autenticación (`auth.spec.ts`).
     * Pruebas del servicio de autenticación (`authService.spec.ts`).
     * Pruebas de la pantalla de Login móvil (`LoginPage.spec.ts`) validando renderizado, tipos de teclado, validación de campos, autorelleno y feedback con toast.
   - Ejecutar la suite de pruebas (`npm run test:unit`) y verificar la compilación del proyecto (`npm run build`).

### Decisiones relevantes

- Se reutiliza íntegramente la lógica de `src/services/` y `src/stores/auth.js` de `/frontend-vue` sin alteraciones de arquitectura, asegurando consistencia entre la plataforma web y la móvil.
- Para el feedback visual se adopta `toastController` propio de Ionic, descartando PrimeVue u otras bibliotecas externas de interfaz.
- La navegación utiliza `@ionic/vue-router` con redirección mediante `router.replace` tras el cierre de sesión, garantizando que el historial de navegación móvil quede saneado y no sea posible regresar con el botón atrás a áreas protegidas.
- Los campos de formulario emplean directivas semánticas (`type="email"`, `inputmode="email"`, `type="password"`) para garantizar una óptima experiencia táctil en teclado de pantalla móvil.

### Riesgos y dudas

- Asegurar que el entorno de pruebas jsdom con Vitest resuelva adecuadamente los Web Components de Ionic o cuente con los stubs/mocks necesarios (en particular `toastController`).

---

## TEST_PLAN

### Pruebas automáticas previstas

Se usan pruebas automáticas con `vitest` y `@vue/test-utils` para verificar la lógica del store de autenticación móvil, la capa de servicios y la pantalla de inicio de sesión con patrones táctiles.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Inicializar authStore sin token previo | Sesión inactiva (`user=null`, `token=null`, `isAuthenticated=false`) | OK (Sesión inactiva y estado limpio) |
| Restaurar sesión previa desde `localStorage` | Sesión restaurada con datos de usuario y token válido | OK (Sesión y perfil restaurados correctamente) |
| Login exitoso en authStore | Guarda token y usuario, activa sesión y limpia errores previos | OK (Token persistido y sesión activa) |
| Login con credenciales incorrectas en authStore | Captura error 401, mantiene sesión inactiva y almacena mensaje de error | OK (Error 401 capturado y sesión inactiva) |
| Logout en authStore | Elimina token y usuario de la reactividad y de `localStorage` | OK (Estado y almacenamiento local limpios) |
| Inyección de cabecera de autenticación en cliente API | Cliente HTTP añade `Authorization: Bearer <token>` cuando hay sesión | OK (Cabecera Authorization añadida correctamente) |
| Interceptor API sin token en localStorage | Peticiones no incluyen cabecera Authorization innecesaria | OK (Cabecera Authorization no presente) |
| Validar formulario de login móvil con campos vacíos | Mensajes de campo obligatorio para email y contraseña en `<ion-note>` sin enviar petición | OK (Validación bloquea envío y muestra avisos) |
| Validar formato inválido de correo en login móvil | Mensaje de advertencia de formato de email no válido junto al campo | OK (Validación de formato de email activa) |
| Atributos de teclado móvil en campos de formulario | Campo de correo posee `type="email"` e `inputmode="email"` y clave `type="password"` | OK (Teclados móviles configurados adecuadamente) |
| Autocompletar credenciales de prueba en login móvil | Rellena formulario con `ana@test.com` y `12345678` al pulsar el botón demo | OK (Formulario autorellenado correctamente) |
| Notificación de error tras fallo de autenticación | Invoca `toastController.create` con mensaje descriptivo y color destructivo | OK (Toast de error emitido) |
| Redirección y bloqueo de historial tras logout | Limpia credenciales y realiza navegación de reemplazo impidiendo retorno | OK (Sesión cerrada e historial protegido) |

### Tests automáticos ejecutados

- `frontend-ionic/tests/unit/services/authService.spec.ts` (4 tests)
- `frontend-ionic/tests/unit/stores/auth.spec.ts` (5 tests)
- `frontend-ionic/tests/unit/views/HomePage.spec.ts` (3 tests)
- `frontend-ionic/tests/unit/views/LoginPage.spec.ts` (6 tests)

Total en el frontend móvil: **4 suites y 18 pruebas automáticas superadas con éxito (100%)**.

---

## AI_LOG

### Herramienta usada

- Herramienta: Antigravity
- Modelo: Gemini 3.8 Flash
- Tipo: asistente de desarrollo

### Uso realizado

Se usó la IA para:
- Estructurar la especificación (SPEC), plan (PLAN) y plan de pruebas (TEST_PLAN) de la iteración 15 adaptada a la metodología móvil con Ionic para Vue.
- Configurar el entorno de `/frontend-ionic` incorporando las dependencias base (`pinia`, `axios`) y variables de entorno (`.env`).
- Reutilizar la capa de servicios HTTP (`src/services/api.js`, `src/services/authService.js`) y el store reactivo `useAuthStore` procedentes de `/frontend-vue`.
- Configurar `@ionic/vue-router` con guardia de navegación para proteger rutas privadas y prevenir el acceso al login con sesión activa.
- Desarrollar la pantalla de inicio de sesión `LoginPage.vue` con componentes de Ionic (`ion-page`, `ion-card`, `ion-input`, `ion-note`) adaptada a teclados táctiles.
- Implementar la toolbar móvil de sesión en `HomePage.vue` y el flujo de cierre de sesión con reemplazo de historial (`router.replace`) para sanitizar la pila de navegación.
- Diseñar y ejecutar la batería de pruebas unitarias y de componentes con Vitest y `@vue/test-utils` en el entorno móvil (18 pruebas superadas con éxito).
- Compilar la aplicación móvil para producción con `npm run build`.

### Prompts importantes

- "te he creado el documento de la iteración 15 con el spec; reutilizaremos la capa de servicios y el authStore de frontend-vue tal cual, y en frontend-ionic adaptaremos la navegación y la vista de login a componentes nativos de Ionic"
- "asegura que el input de email tenga type='email' e inputmode='email' para desplegar el teclado adecuado en móvil, y que las validaciones se muestren junto a cada campo con ion-note"
- "tras el logout, limpia la sesión y haz un router.replace a /login para que la pila de navegación de Ionic no permita regresar mediante el botón atrás"
- "perfecto, comienza con la implementación"

### Resultado

Implementación completa y validada de la base del frontend móvil en Ionic para Vue y del flujo de autenticación (Login/Logout y navegación protegida). Se han superado las 18 pruebas unitarias y de integración de componentes al 100%, y el build de producción con `vue-tsc` y `vite build` se genera limpiamente.

### Decisión del estudiante

- Se acordó reutilizar al 100% los archivos de servicios (`api.js`, `authService.js`) y el store de autenticación (`auth.js`) de `frontend-vue` para evitar discrepancias lógicas entre web y móvil.
- Se adoptó el componente nativo `toastController` de Ionic para las alertas y avisos temporales, asegurando una integración nativa en plataformas móviles.
- Se exigió la configuración explícita de `type="email"` e `inputmode="email"` en el formulario para optimizar la interacción con teclados táctiles virtuales.
- Se estableció la invalidación del historial mediante `router.replace` en el cierre de sesión para asegurar que no se pueda retroceder a rutas privadas.

### Correcciones manuales

- Configuración de `compilerOptions.isCustomElement` o stubs en el harness de Vitest para los componentes con prefijo `ion-` en el entorno de pruebas.
- Inclusión de `await flushPromises()` tras el disparo de eventos de formulario en `LoginPage.spec.ts` para sincronizar las resoluciones de promesas internas asíncronas antes de verificar redirecciones.

---

## COMMITS RELACIONADOS

- (Pendiente de commit tras implementación)
