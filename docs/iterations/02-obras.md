# Iteración 02 - Catálogo de obras

## SPEC

### Objetivo

Implementar la gestión básica del catálogo de obras para permitir crear nuevas obras y consultarlas desde el backend.

### Requisitos

- Crear una nueva obra con los campos mínimos: título, tipo, género, año, duración y sinopsis.
- Validar que los campos obligatorios no estén vacíos.
- Listar todas las obras almacenadas.
- Consultar el detalle de una obra por su identificador.
- Devolver un error claro si la obra no existe.
- Devolver una respuesta válida con lista vacía si no hay obras registradas.
- Manejar errores de validación y de consulta con mensajes HTTP adecuados.

### Fuera de alcance

- Editar obras.
- Eliminar obras.
- Filtros avanzados por género, tipo o año.
- Búsqueda compleja o full-text.
- Persistencia real en base de datos.
- Subidas de imágenes o metadatos complejos.

## PLAN

1. Crear un almacén en memoria para obras dentro del backend.
2. Definir las rutas de la API:
   - `GET /api/works`
   - `GET /api/works/:id`
   - `POST /api/works`
3. Implementar un servicio `workService` con validación de campos y lógica de consulta.
4. Crear un controlador `workController` para centralizar la gestión de respuestas HTTP.
5. Añadir validaciones básicas:
   - título obligatorio
   - tipo obligatorio
   - género obligatorio
   - año válido
   - duración requerida
   - sinopsis obligatoria
6. Definir respuestas consistentes para casos de éxito, vacío y error.
7. Probar con casos de creación, listado y detalle.

### Decisiones relevantes

- Se mantiene un almacenamiento en memoria para esta iteración para poder validar rápidamente el comportamiento del backend sin depender de una base de datos.
- Se limita el alcance a creación y consulta, porque editar y eliminar obras requieren un criterio más amplio de validación y no aportan un valor mínimo para esta iteración.
- Se decide mantener una estructura modular con `routes`, `controllers` y `services` para facilitar la ampliación en futuras iteraciones.

### Riesgos y dudas

- La validación del año y la duración puede requerir ajustes según se definan las reglas de negocio del proyecto.
- En futuras iteraciones será necesario decidir si el tipo de obra se maneja como enumerado o como texto libre.

## TEST_PLAN

### Pruebas automáticas previstas

Se usarán pruebas con `node:test` y `supertest` para comprobar el comportamiento principal del catálogo.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Crear obra con datos válidos | 201 y obra creada | OK (201) |
| Crear obra sin título | 400 y mensaje de error | OK (400) |
| Crear obra sin género | 400 y mensaje de error | OK (400) |
| Listar obras cuando no hay ninguna | 200 y lista vacía | OK (200 y []) |
| Listar obras con contenido | 200 y array de obras | OK (200 y 2 obras) |
| Obtener una obra existente | 200 y detalle de la obra | OK (200) |
| Obtener una obra inexistente | 404 y mensaje de error | OK (404) |

### Tests automáticos previstos

- `backend/tests/works.test.js`

## AI_LOG

### Herramienta usada

- Herramienta: GitHub Copilot
- Modelo: MAI-Code-1.1-Flash
- Tipo: asistente de desarrollo

### Uso realizado

Se usó la IA para:

- proponer un plan de implementación para el catálogo de obras;
- revisar el alcance de la iteración para que no se expandiera a funcionalidades no requeridas;
- sugerir validaciones mínimas y mensajes HTTP coherentes.

### Prompt importante

- “Diseña una iteración del backend para gestionar un catálogo de obras con alcance limitado. La funcionalidad debe incluir crear, listar y consultar obras. No añadas edición ni eliminación ni filtros complejos.”

### Resultado

La IA ayudó a acotar bien el alcance, pero se revisó a mano la propuesta para mantener la iteración enfocada en la creación y consulta de obras.

### Decisión del estudiante

Se aceptó la idea de limitar la iteración a creación, listado y detalle.
Se rechazó incluir edición, borrado y filtros avanzados porque no forman parte de esta entrega.

### Correcciones manuales

- Se eliminó la idea de “CRUD completo” para adaptar el alcance a una iteración pequeña y comprobable.
- Se ajustó el nombre de la iteración para que hable de “obras” y no de “películas”.

## COMMITS RELACIONADOS

- "855e612701dbe219283902e420a3cd9c42779d85"
