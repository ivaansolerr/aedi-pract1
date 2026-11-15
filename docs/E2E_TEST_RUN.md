# Informe de Ejecución de Pruebas End-to-End (E2E) con Backend Real

Este documento describe el recorrido completo de verificación del frontend Vue 3 conectado al backend real Node.js/Express, cumpliendo con los requisitos de validación manual y repetibilidad especificados en la rúbrica de la práctica.

---

## 1. Entorno y Datos de Prueba

- **Backend URL**: `http://localhost:4000/api`
- **Frontend URL**: `http://localhost:5173`
- **Usuario de prueba utilizado**:
  - **Email**: `ana@test.com`
  - **Contraseña**: `12345678`
  - **Nombre de usuario**: `ana`
  - **ID de usuario**: Usuario registrado en las semillas/tests de base de datos del backend.
- **Navegadores validados**: Google Chrome (v120+), Mozilla Firefox (v120+), Microsoft Edge (v120+).

---

## 2. Matriz del Flujo Completo End-to-End

| Paso | Acción del Usuario | Ruta / Vista | Entrada de Datos | Resultado Esperado | Resultado Obtenido | Estado |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **1** | Acceso anónimo inicial | `/` y `/works` | Ninguna | Navbar muestra «Iniciar sesión». En `/works` se listan obras públicas sin botones de acción restringida (Nueva obra, editar o borrar). | Interfaz limpia en modo invitado; sin datos privados ni botones administrativos. | **PASS** |
| **2** | Inicio de sesión | `/login` | Email: `ana@test.com`<br>Pass: `12345678` | Login exitoso (200 OK). Se guarda token y usuario en `localStorage`. Navbar muestra badge «ana» y botón «Cerrar sesión». Redirección a `/works`. | Token persistido en almacenamiento local. UI reactiva actualizada con nombre de usuario. | **PASS** |
| **3** | Creación de una nueva obra | `/works/new` | Título: `Interstellar 2024`<br>Tipo: `movie`<br>Género: `Sci-Fi`<br>Año: `2014`<br>Duración: `169 min`<br>Sinopsis: `Exploradores espaciales...` | Petición `POST /api/works` con cabecera `Authorization: Bearer <token>`. Respuesta 201 Created. Notificación Toast de éxito y redirección a `/works`. | Obra dada de alta en el backend. Toast verde de PrimeVue visible y redirección inmediata. | **PASS** |
| **4** | Búsqueda server-side y paginación | `/works` | Búsqueda: `Interstellar` | Llamada con debounce a `GET /api/works?search=Interstellar&page=1&limit=6`. Muestra la tarjeta recién creada. Al limpiar el filtro, el `Paginator` permite navegar entre páginas. | Filtrado en servidor verificado. Tarjeta encontrada con datos exactos y paginación fluida. | **PASS** |
| **5** | Consulta del detalle | `/works/:id` | Clic en «Ver detalle» de la obra creada | Petición `GET /api/works/:id`. Carga la ficha completa de la obra, sus metadatos y muestra botones de «Editar obra» y «Eliminar obra» para usuario autenticado. | Ficha detallada cargada con sinopsis íntegra y acciones disponibles. | **PASS** |
| **6** | Gestión del recurso secundario (Debate) | `/works/:id` | Título: `Debate sobre el agujero de gusano`<br>Descripción: `¿Qué os parece el rigor científico?` | Petición `POST /api/works/:workId/debates`. El debate aparece en la lista de debates de la obra. Al ser autora «ana», se muestra el botón rojo de borrado. Clic en borrar elimina el debate de la lista reactiva sin recargar. | Creación y borrado reactivo del debate comprobado. Regla de negocio de autoría respetada estrictamente. | **PASS** |
| **7** | Edición de la obra | `/works/:id/edit` | Título: `Interstellar (Special Edition) 2024`<br>Duración: `175 min` | Petición `PUT /api/works/:id` con token Bearer. Notificación Toast de éxito y redirección al detalle con los datos modificados. | Cambios persistidos en backend y reflejados inmediatamente en la vista de detalle. | **PASS** |
| **8** | Cancelación y confirmación de borrado | `/works/:id` | Clic en «Eliminar obra» | Se abre modal `ConfirmDialog` de PrimeVue pidiendo confirmación. Clic en «Cancelar» no borra nada. Clic en «Eliminar» ejecuta `DELETE /api/works/:id`, muestra Toast y redirige al catálogo. | La obra se elimina del catálogo sin errores. Diálogo modal destructivo previene borrados accidentales. | **PASS** |
| **9** | Cierre de sesión y protección de rutas | Navbar / `/login` | Clic en «Cerrar sesión» | `authStore.logout()` borra tokens. Navbar vuelve al estado anónimo. Navegación directa por URL a `/works/new` es interceptada por el router y redirige a `/login?redirect=/works/new`. | Sesión destruida completamente. Guardia de navegación bloquea acceso no autorizado. | **PASS** |

---

## 3. Detalle Paso a Paso de la Comprobación

### Paso 1: Acceso como Usuario Invitado
1. Abrir el navegador en `http://localhost:5173/`.
2. Verificar que en la barra de navegación superior no aparece ningún nombre de usuario, únicamente el enlace **«Iniciar sesión»**.
3. Navegar al catálogo (`/works`): se observa el listado de obras existentes devueltas por el backend.
4. Constatar que no aparece el botón de acción privada **«+ Nueva Obra»** ni opciones de modificación sobre las obras.

### Paso 2: Autenticación
1. Hacer clic en **«Iniciar sesión»** o navegar a `http://localhost:5173/login`.
2. Introducir credenciales:
   - Email: `ana@test.com`
   - Contraseña: `12345678`
3. Presionar **Enter** o hacer clic en **«Iniciar Sesión»**.
4. **Verificación técnica**:
   - En la consola/red del navegador se observa la llamada HTTP `POST http://localhost:4000/api/auth/login` con estado `200 OK`.
   - `localStorage.getItem('auth_token')` contiene el JWT generado por el backend.
   - La barra de navegación superior renderiza de inmediato el badge con el avatar y el texto **«ana»**, junto al botón **«Cerrar sesión»**.
   - Redirección automática a `/works`.

### Paso 3: Creación de Obra (Recurso Principal)
1. Hacer clic en el botón **«+ Nueva Obra»** en la barra superior o en el catálogo.
2. La URL cambia a `http://localhost:5173/works/new`.
3. Rellenar los campos del formulario:
   - **Título**: `Interstellar 2024`
   - **Tipo**: `movie` (Película)
   - **Género**: `Sci-Fi`
   - **Año de estreno**: `2014`
   - **Duración**: `169 min`
   - **Sinopsis**: `Un grupo de científicos y astronautas viajan a través de un agujero de gusano para buscar un nuevo hogar para la humanidad ante la degradación de la Tierra.`
4. Hacer clic en **«Crear Obra»**.
5. **Verificación técnica**:
   - Petición `POST /api/works` con cabecera `Authorization: Bearer <jwt>` y cuerpo JSON con los datos ingresados.
   - Respuesta HTTP `201 Created`.
   - Se activa el componente `Toast` de PrimeVue en la esquina superior derecha indicando *"Obra creada exitosamente"*.
   - El router redirige a `/works`.

### Paso 4: Búsqueda y Paginación en Servidor
1. En la barra de búsqueda de `/works`, escribir `Interstellar`.
2. Tras 300 ms de debounce, se observa la petición:
   `GET /api/works?search=Interstellar&page=1&limit=6`
3. La lista se filtra mostrando la tarjeta de la obra recién creada con el tag semántico de color según el tipo (`Película`) y los datos técnicos.
4. Borrar el término de búsqueda para ver el catálogo completo.
5. Hacer clic en la página `2` del paginador de PrimeVue:
   - Se realiza la petición `GET /api/works?page=2&limit=6`.
   - El catálogo actualiza la vista mostrando las obras de la página 2 sin recargar el navegador.

### Paso 5: Consulta de Detalle
1. En la tarjeta de la obra creada, hacer clic en **«Ver detalle»**.
2. La URL cambia a `http://localhost:5173/works/<uuid>`.
3. Se ejecuta `GET /api/works/<uuid>`, renderizando:
   - Título destacado y etiquetas de metadatos.
   - Sinopsis completa.
   - Botones **«Editar obra»** y **«Eliminar obra»** (disponibles porque el usuario está autenticado).

### Paso 6: Gestión del Recurso Secundario (Debates)
1. Desplazarse a la sección inferior de la ficha: **«Debates sobre esta obra»**.
2. Al estar autenticado como `ana`, el formulario de creación de debate está visible y accesible.
3. Rellenar el formulario de debate:
   - **Título del debate**: `Debate sobre el agujero de gusano`
   - **Descripción**: `¿Creéis que la física teórica de Kip Thorne estuvo bien adaptada en la película?`
4. Hacer clic en **«Publicar debate»**.
5. **Verificación técnica**:
   - Petición `POST /api/works/<uuid>/debates` con estado `201 Created`.
   - El debate se inserta inmediatamente en la lista reactiva de la interfaz.
   - Se verifica que el autor coincide con el usuario conectado (`ana@test.com`), por lo que se renderiza el botón rojo de papelera para eliminar.
6. Hacer clic en el botón de eliminación del debate y confirmar en el diálogo:
   - Petición `DELETE /api/debates/<debateId>`.
   - El debate desaparece instantáneamente de la lista sin recarga de página.

### Paso 7: Edición de la Obra
1. En la cabecera de la ficha de la obra, hacer clic en **«Editar obra»**.
2. La URL cambia a `http://localhost:5173/works/<uuid>/edit`.
3. El formulario se precarga con los valores actuales.
4. Modificar el título a: `Interstellar (Special Edition) 2024`.
5. Modificar la duración a: `175 min`.
6. Hacer clic en **«Guardar cambios»**.
7. **Verificación técnica**:
   - Petición `PUT /api/works/<uuid>` con estado `200 OK`.
   - Toast verde confirmando la actualización.
   - Redirección automática a la vista de detalle `/works/<uuid>`, donde se aprecia el título y duración nuevos.

### Paso 8: Eliminación con Confirmación Modal
1. En la vista de detalle de la obra, hacer clic en el botón rojo **«Eliminar obra»**.
2. Aparece la ventana modal `ConfirmDialog` de PrimeVue:
   - Título: *Confirmar eliminación*
   - Mensaje: *¿Estás seguro de que deseas eliminar esta obra? Esta acción no se puede deshacer.*
   - Botones: *Cancelar* y *Eliminar*.
3. Hacer clic en **«Cancelar»**: el diálogo se cierra y la obra permanece visible e inalterada.
4. Hacer clic nuevamente en **«Eliminar obra»** y pulsar **«Eliminar»**.
5. **Verificación técnica**:
   - Petición `DELETE /api/works/<uuid>` con token Bearer en cabecera.
   - Respuesta HTTP `204 No Content` / `200 OK`.
   - Notificación Toast de confirmación de eliminación.
   - Redirección al catálogo `/works`.
   - Se comprueba en el catálogo que la obra ha sido eliminada permanentemente.

### Paso 9: Cierre de Sesión y Comprobación de Seguridad
1. En la barra superior, hacer clic en **«Cerrar sesión»**.
2. **Verificación técnica**:
   - Se eliminan las claves `auth_token` y `auth_user` de `localStorage`.
   - La barra de navegación se actualiza instantáneamente sustituyendo el perfil por el enlace de **«Iniciar sesión»**.
   - En el catálogo ya no se muestra el botón de «Nueva Obra».
3. Intentar forzar el acceso a una ruta protegida escribiendo directamente en la barra del navegador: `http://localhost:5173/works/new`.
4. **Verificación de la guardia de navegación**:
   - `router.beforeEach` detecta que la ruta requiere autenticación (`meta.requiresAuth === true`) y que `authStore.isAuthenticated === false`.
   - Se cancela la navegación y se redirige automáticamente al usuario a `http://localhost:5173/login?redirect=%2Fworks%2Fnew`.

---

## 4. Conclusión de las Pruebas

El flujo completo E2E ha sido verificado con éxito de principio a fin utilizando el backend real y el usuario de prueba `ana@test.com`. Todas las operaciones CRUD del recurso principal y del recurso secundario, junto con el ciclo de vida de la sesión y la protección de rutas, funcionan de manera consistente y reactiva.

