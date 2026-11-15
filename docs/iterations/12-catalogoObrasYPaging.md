# Iteración 12 - Catálogo de obras, búsqueda y paginación

## SPEC

### Objetivo

Permitir a los usuarios y visitantes explorar el catálogo de obras de la plataforma mediante un listado visual con búsqueda por texto y filtros combinables, conectado a la paginación del backend para navegar de forma fluida entre resultados.

### Requisitos

- Cualquier visitante o usuario puede consultar el catálogo de obras desde la página principal o la barra de navegación.
- Las obras se presentan visualmente con su información principal (título, tipo, género, año de estreno y sinopsis).
- El usuario puede buscar obras por título mediante un campo de búsqueda interactivo.
- El usuario puede filtrar el catálogo combinando tipo de obra (película, serie, libro), género y año de estreno.
- Los resultados deben responder a la paginación del servidor, mostrando el número total de obras y permitiendo cambiar de página o de límite de elementos.
- Si no hay obras que coincidan con la búsqueda o filtros aplicados, la aplicación debe mostrar un mensaje amigable de lista vacía con opción de limpiar los filtros.
- Cada obra debe incluir un enlace o botón para acceder a su ficha detallada (preparado para la siguiente iteración).
- La interfaz debe mostrar indicadores de carga mientras se obtienen los resultados del backend.

### Fuera de alcance

- Creación, edición o borrado de obras (Iteración 13).
- Detalle completo y gestión de debates de la obra (Iteración 13 y 14).
- Ordenación por múltiples columnas complejas no soportadas por el backend.

---

## PLAN

1. **Capa de Servicios (`src/services/workService.js`)**:
   - Crear `workService.js` para desacoplar las llamadas al endpoint `GET /api/works`.
   - Método `getWorks({ title, type, genre, release_year, page, limit })`:
     * Envía la petición con los parámetros limpios en la query string.
     * Retorna `{ works, pagination }` según la especificación del backend.

2. **Gestión de Estado Compartido con Pinia (`src/stores/works.js`)**:
   - Crear el store `useWorksStore` con estado reactivo:
     * `works`: Array de obras devueltas para la página actual.
     * `pagination`: Objeto con `{ total, page, limit, totalPages }`.
     * `filters`: Objeto reactivo `{ title, type, genre, release_year }`.
     * `isLoading`: Booleano para el indicador de carga.
     * `errorMessage`: Cadena para capturar posibles errores de conexión.
   - Acciones:
     * `fetchWorks(params)`: Consulta el servicio con los filtros y paginación activos.
     * `setPage(newPage)`: Cambia la página y vuelve a cargar los datos.
     * `setFilters(newFilters)`: Aplica filtros, reinicia la página a 1 y consulta el catálogo.
     * `resetFilters()`: Limpia los criterios de búsqueda y recarga el catálogo desde la primera página.

3. **Componente de Tarjeta de Obra (`src/components/WorkCard.vue`)**:
   - Ficha visual de la obra construida con `Card` y `Tag` de PrimeVue.
   - Muestra: título, tipo de obra (con color distintivo según sea película, serie o libro), género, año de estreno, duración/páginas y sinopsis.
   - Botón de acción "Ver detalles" con enlace hacia `/works/:id`.

4. **Componente de Filtros y Búsqueda (`src/components/WorksFilterBar.vue`)**:
   - Formulario integrado con componentes de PrimeVue:
     * Input de búsqueda por título (`InputText` con icono de lupa).
     * Desplegable para tipo de obra (`Select` o `Dropdown`: Todas, Película, Serie, Libro).
     * Input para género (`InputText`).
     * Input para año (`InputNumber` o `InputText`).
     * Botones de acción "Filtrar" y "Limpiar filtros".

5. **Vista de Catálogo de Obras (`src/views/WorksListView.vue`)**:
   - Vista principal del catálogo que organiza:
     * La barra de filtros en la parte superior.
     * Cuadrícula responsiva de tarjetas (`WorkCard`) para las obras.
     * Estado de carga con indicador (`ProgressSpinner` / Skeleton).
     * Panel de lista vacía cuando no hay resultados, con botón para resetear filtros.
     * Componente `Paginator` de PrimeVue conectado reactivamente a los metadatos de paginación del backend (`totalRecords`, `rows`, `page`).

6. **Rutas y Navegación**:
   - Configurar la ruta `/works` y asociar `/` para que los usuarios accedan directamente al catálogo.
   - Actualizar el enlace "Obras" en `AppNavbar.vue` para navegar fluidamente al catálogo.

7. **Pruebas automáticas (Vitest)**:
   - Tests de servicio `workService`: validación de llamadas y envío de parámetros de filtrado y paginación.
   - Tests de store `worksStore`: verificación de carga, paginación, filtros y reseteo.
   - Tests de componentes con `@vue/test-utils`: renderizado de `WorkCard` y visualización condicional en `WorksListView`.
   - Ejecutar la suite completa y validar el build de producción.

### Decisiones relevantes

- Se utiliza el componente `Paginator` nativo de PrimeVue conectado directamente a `pagination.total` y `pagination.limit` del backend para ofrecer una paginación server-side estándar y configurable.
- Los filtros se gestionan de forma centralizada en el store `useWorksStore`, permitiendo conservar el estado de búsqueda mientras el usuario navega por la aplicación.
- Se implementan badges (`Tag`) de PrimeVue con variantes semánticas según el tipo de obra (`movie`, `series`, `book`) para mejorar la jerarquía visual y lectura rápida.

### Riesgos y dudas

- Asegurar que los parámetros vacíos en los filtros no se envíen como cadenas vacías que puedan interferir con los filtros del backend (enviar solo parámetros con valor).

---

## TEST_PLAN

### Pruebas automáticas previstas

Se usan pruebas automáticas con `vitest` y `@vue/test-utils` para validar el servicio de obras, el store de Pinia y los componentes de visualización.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Obtener catálogo paginado en `workService` | Retorna lista de obras y metadatos de paginación (`total`, `page`, `limit`, `totalPages`) | OK (Retorna obras y objeto de paginación) |
| Filtrar obras por título en `workService` | Envía el parámetro `title` en la consulta HTTP a `/works` | OK (Query params limpios y correctos) |
| Carga inicial en `useWorksStore` | Almacena obras, actualiza paginación y finaliza estado de carga | OK (Obras cargadas y estado reactivo actualizado) |
| Cambiar de página en `useWorksStore` | Actualiza la página actual y solicita la página correspondiente | OK (Página 2 solicitada y sincronizada) |
| Aplicar filtros en `useWorksStore` | Actualiza filtros, reinicia la página a 1 y recarga el listado | OK (Filtros aplicados y reset a página 1) |
| Limpiar filtros en `useWorksStore` | Restablece los filtros a valores por defecto y recarga desde la página 1 | OK (Filtros reseteados y vuelta a página 1) |
| Renderizar información completa en `WorkCard` | Muestra título, tipo, género, año, duración y sinopsis | OK (Todos los campos visualizados con badges) |
| Mostrar mensaje de catálogo vacío | Muestra mensaje de "No se encontraron obras" si el listado está vacío | OK (Mensaje amigable y botón de limpieza presentes) |
| Paginador conectado a datos del backend | Muestra el total de registros y páginas según la respuesta del backend | OK (Paginator vinculado a metadatos reales) |

### Tests automáticos previstos

- `frontend-vue/src/services/__tests__/workService.spec.js` (2 tests)
- `frontend-vue/src/stores/__tests__/works.spec.js` (6 tests)
- `frontend-vue/src/components/__tests__/WorkCard.spec.js` (3 tests)
- `frontend-vue/src/views/__tests__/WorksListView.spec.js` (5 tests)

Total acumulado en el frontend: **8 suites y 32 pruebas automáticas superadas con éxito (100%)**.

---

## AI_LOG

### Herramienta usada

- Herramienta: Antigravity
- Modelo: Gemini 3.8 Flash
- Tipo: asistente de desarrollo

### Uso realizado

Se usó la IA para:
- Estructurar la especificación (SPEC), plan (PLAN) y plan de pruebas (TEST_PLAN) de la iteración 12 para el catálogo de obras con paginación y filtros.
- Implementar el servicio `workService.js` con limpieza de parámetros nulos/vacíos para peticiones limpias a `GET /api/works`.
- Crear el store reactivo de obras `useWorksStore` con gestión de catálogo, filtros combinables, estado de carga y navegación server-side por páginas.
- Diseñar el componente `WorkCard.vue` con tags semánticos por tipo de obra (`movie`, `series`, `book`), metadatos y enlace a detalles.
- Construir el componente `WorksFilterBar.vue` con PrimeVue para búsqueda de título, filtro de tipo, género, año y acciones de aplicar/limpiar.
- Desarrollar la vista principal `WorksListView.vue` con grid responsivo, estado vacío, indicador de carga y paginador (`Paginator`) conectado al backend.
- Configurar y validar 16 nuevas pruebas automáticas con Vitest y `@vue/test-utils` (alcanzando 32 tests pasando al 100% en el frontend).
- Verificar la compilación para producción con `npm run build`.

### Prompts importantes

- "te he creado el documento de la iteración 12 con el spec, revisalo y completalo"
- "perfecto, continua con la implementación"

### Resultado

Implementación completa y verificada del catálogo de obras con búsqueda interactiva, filtrado combinado y paginación server-side fluida. La suite completa del frontend alcanza 32 pruebas superadas con éxito y el build de Vite se genera correctamente.

### Decisión del estudiante

- Se acordó centralizar el estado de los filtros en `useWorksStore` para que la búsqueda y paginación persistan coherentemente.
- Se conectó el `Paginator` nativo de PrimeVue directamente con las variables de paginación del backend (`total`, `limit`, `page`).
- Se definió que la página principal (`/` y `/works`) exponga de forma inmediata el catálogo de obras con acceso directo para visitantes y miembros.

### Correcciones manuales

- Incorporación del mock de `workService.getWorks` en `WorksListView.spec.js` para evitar llamadas reales no controladas de red durante el ciclo de vida `onMounted` en entorno jsdom.

---

## COMMITS RELACIONADOS

- Pendiente de commit local por el usuario
