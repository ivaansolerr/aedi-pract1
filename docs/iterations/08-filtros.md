# Iteración 08 - Filtro y búsqueda avanzada

## SPEC

### Objetivo

Implementar la búsqueda y filtrado avanzado en el catálogo de obras y la visualización de los debates asociados dentro de la ficha de cada obra.

### Requisitos

- Cualquier usuario puede buscar obras por título mediante coincidencia parcial de texto.
- Cualquier usuario puede filtrar obras por su tipo (libro, película, serie).
- Cualquier usuario puede filtrar obras por su temática o género.
- Cualquier usuario puede filtrar obras por su año de lanzamiento.
- Se pueden combinar múltiples filtros en una misma consulta.
- Si ninguna obra coincide con los filtros especificados, se devuelve una lista vacía.
- Al consultar el detalle de una obra, se debe incluir la lista de debates asociados a dicha obra.
- Responder con error adecuado si se consulta una obra que no existe.

### Fuera de alcance

- Paginación avanzada o cursores.
- Búsqueda semántica o procesamiento de lenguaje natural.
- Ordenación personalizada dinámica por múltiples campos.

---

## PLAN

1. Actualizar `src/models/workModel.js`:
   - Extender `findAllWorks({ title, type, genre, release_year })` para construir dinámicamente la cláusula `WHERE` con parámetros seguros (`$1, $2, ...`), usando coincidencias insensibles a mayúsculas/minúsculas para título y género.
   - Mantener compatibilidad total cuando no se envíen filtros (devolviendo todas las obras).
2. Actualizar `src/services/workService.js`:
   - Modificar `listWorks(filters)` para pasar los filtros recibidos al modelo.
   - Modificar `getWorkById(id)` para consultar tanto la obra como sus debates vinculados (a través de `findAllDebates({ workId: id })`), adjuntando la lista de debates en la respuesta (`work.debates`).
3. Actualizar `src/controllers/workController.js`:
   - Extraer `req.query` (`title`, `type`, `genre`, `release_year`) en `getAll` y suministrarlos a `listWorks`.
4. Extender la suite de pruebas en `backend/tests/works.test.js`:
   - Filtro por título parcial.
   - Filtro por tipo de obra.
   - Filtro por género.
   - Filtro por año de lanzamiento.
   - Filtros combinados simultáneos.
   - Búsqueda sin coincidencias devuelve lista vacía.
   - Obtención de detalle de obra incluye sus debates asociados.
5. Ejecutar la suite completa (`npm test`) y comprobar que los 60 tests existentes más los nuevos pasen al 100%.

### Decisiones relevantes

- Los filtros son opcionales y combinables entre sí mediante condiciones `AND`, lo que permite búsquedas precisas (por ejemplo, buscar películas de ciencia ficción del año 2021).
- La inclusión de debates asociados en la consulta de una obra evita peticiones adicionales al cliente y satisface la especificación descrita en `ARCHITECTURE.md`.

### Riesgos y dudas

- Asegurar que la construcción dinámica de filtros SQL maneje adecuadamente los índices de parámetros `$1, $2, ...` para evitar errores de sintaxis tanto en PostgreSQL real como en `pg-mem`.

---

## TEST_PLAN

### Pruebas automáticas previstas

Se usarán pruebas automáticas con `node:test` y `supertest` para validar el filtrado y la inclusión de debates.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Filtrar obras por título con coincidencia parcial | 200 y array con las obras que coinciden | OK (200 y filtrado por título) |
| Filtrar obras por tipo de obra | 200 y array filtrado por tipo | OK (200 y filtrado por tipo) |
| Filtrar obras por género | 200 y array filtrado por género | OK (200 y filtrado por género) |
| Filtrar obras por año de lanzamiento | 200 y array filtrado por año | OK (200 y filtrado por año) |
| Combinar múltiples filtros en la misma búsqueda | 200 y solo obras que cumplen todos los criterios | OK (200 y combinación de filtros) |
| Búsqueda con filtros sin coincidencias | 200 y array vacío | OK (200 y array vacío) |
| Consultar detalle de obra incluye sus debates asociados | 200 con ficha de obra y lista de debates | OK (200 y debates asociados incluidos) |

### Tests automáticos previstos

- `backend/tests/works.test.js`

---

## AI_LOG

### Herramienta usada

- Herramienta: Antigravity
- Modelo: Gemini 3.8 Flash
- Tipo: asistente de desarrollo

### Uso realizado

Se usó la IA para:

- estructurar la especificación (SPEC) y plan (PLAN) de la iteración de filtros y debates en obras con formato funcional y conciso;
- definir los contratos de los parámetros query de `GET /api/works` y la respuesta enriquecida de `GET /api/works/:id`;
- implementar la consulta dinámica con filtros paramétricos seguros en `workModel.js`;
- actualizar `workService.js` para enriquecer la ficha de la obra con sus debates asociados vía `findAllDebates`;
- actualizar el controlador `workController.js` para recibir los query parameters;
- diseñar e implementar la batería de pruebas automáticas en `works.test.js`.

### Prompts importantes

- “ok, perfecto te he dejado el documento de la itearción 8 hecho”
- “adelante, llevala a cabo”

### Resultado

Implementación completa y validada de los filtros avanzados y la vinculación de debates a la ficha de obra. La suite completa del backend alcanza 67 tests automáticos superados con un 100% de éxito y 0 fallos.

### Decisión del estudiante

- Se acordó incorporar los debates vinculados directamente dentro del objeto de la obra en `GET /api/works/:id`, cumpliendo con `ARCHITECTURE.md`.
- Se aceptó la combinación de filtros mediante cláusulas `AND` dinámicas para búsquedas avanzadas en el catálogo.

### Correcciones manuales

- Redacción funcional simplificada de los requisitos en la SPEC.

---

## COMMITS RELACIONADOS

- "8f47a90dd18b349c6937e9d2263e05ef7cee5a92"
