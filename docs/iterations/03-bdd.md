# Iteración 03 - Base de datos

## SPEC

### Objetivo

Implementar la base de datos en PostgreSQL para almacenar de forma consistente el catálogo de obras y los usuarios, sustituyendo el almacenamiento temporal en memoria.

### Requisitos

- Definir el esquema DDL de las tablas `users` y `works` conforme al diseño especificado en `ARCHITECTURE.md`.
- Conectar la API Express a PostgreSQL gestionando la conexión mediante variables de entorno configurables.
- Migrar las operaciones de usuarios (`register`, `login`, `getProfile`) para consultar y persistir datos en la tabla `users`.
- Manejar adecuadamente los errores de unicidad de email delegados o validados por la base de datos (HTTP 409).
- Migrar las operaciones del catálogo de obras (`create`, `getAll`, `getOne`) para consultar y persistir datos en la tabla `works`.
- Asegurar que todos los métodos de consulta y persistencia operen de forma asíncrona (`async/await`).
- Mantener intactos los contratos y códigos de estado HTTP de los endpoints existentes.
- Permitir la limpieza controlada de datos para la ejecución fiable de pruebas automáticas.

### Fuera de alcance

- Creación de tablas no requeridas en esta fase (debates, comentarios, suscripciones, mensajes o relaciones).
- Uso de ORMs pesados (se prioriza el cliente SQL nativo `pg` para mantener el control y ligereza).
- Sistema de migraciones complejo con herramientas externas (se gestionará mediante script SQL inicial de esquema).
- Recuperación de contraseñas o edición avanzada de perfiles.

## PLAN

1. Añadir la dependencia del driver de PostgreSQL (`pg`) y actualizar `package.json`.
2. Actualizar `.env.example` y `src/config/env.js` para incluir la configuración de conexión a PostgreSQL (`DATABASE_URL` o parámetros `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`).
3. Crear un script SQL de inicialización (`schema.sql`) con la definición de las tablas `users` y `works` y sus restricciones (claves primarias UUID, unicidad de email, tipos y timestamps).
4. Implementar el módulo de conexión y pool de clientes en `src/config/db.js`.
5. Crear repositorios/modelos de datos:
   - `src/models/userModel.js` (o `userRepository.js`): `createUser`, `findUserByEmail`, `findUserById`.
   - `src/models/workModel.js` (o `workRepository.js`): `createWork`, `findAllWorks`, `findWorkById`.
6. Refactorizar `authService.js` y `workService.js` para utilizar la capa de base de datos de manera asíncrona.
7. Adaptar los controladores (`authController.js` y `workController.js`) para gestionar las llamadas asíncronas con `async/await` y control de excepciones.
8. Adaptar la suite de tests (`auth.test.js` y `works.test.js`) para reiniciar el estado de la base de datos antes de cada test mediante una utilidad de limpieza (`TRUNCATE`).
9. Ejecutar las pruebas automáticas y comprobar que todos los casos se ejecutan con éxito contra la base de datos.

### Decisiones relevantes

- Se utiliza el driver nativo `pg` (node-postgres) con un `Pool` de conexiones para maximizar rendimiento, control sobre las consultas y simplicidad arquitectónica.
- Se mantiene la estructura por capas (`routes` -> `controllers` -> `services` -> `models/db`) para desacoplar la lógica de negocio del motor de almacenamiento.
- Se preservan exactamente las rutas y respuestas JSON de las iteraciones 01 y 02 para evitar efectos colaterales en clientes o futuras capas frontend.

### Riesgos y dudas

- Requiere disponer de una instancia accesible de PostgreSQL (local, Docker o proyecto en Supabase) para ejecutar los tests y el servidor.
- Asegurar el orden de limpieza de tablas en los tests si se definen claves foráneas en el futuro.

## TEST_PLAN

### Pruebas automáticas previstas

Se adaptarán y ejecutarán las pruebas existentes con `node:test` y `supertest` verificando la persistencia real en la base de datos.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Conexión a la base de datos | Pool conectado y consulta de comprobación exitosa | OK (200 / consulta SELECT) |
| Registro de usuario persistido en DB | 201 y usuario creado con ID UUID | OK (201 y UUID generado) |
| Registro con email duplicado en DB | 409 y mensaje de conflicto | OK (409 y restricción UNIQUE) |
| Login con credenciales válidas desde DB | 200 y token JWT generado | OK (200 y token JWT) |
| Login con contraseña incorrecta contra DB | 401 y error de credenciales | OK (401 y credenciales incorrectas) |
| Crear obra persistida en DB | 201 y obra almacenada correctamente | OK (201 y UUID generado) |
| Crear obra con campos incompletos | 400 y mensaje de error | OK (400 y validación) |
| Listar obras cuando la DB está vacía | 200 y array vacío | OK (200 y []) |
| Listar múltiples obras desde DB | 200 y lista de obras registradas | OK (200 y array de 2 obras) |
| Obtener obra por ID existente desde DB | 200 y datos de la obra | OK (200 y obra devuelta) |
| Obtener obra con ID inexistente en DB | 404 y mensaje de error | OK (404 y mensaje de error) |

### Tests automáticos previstos

- `backend/tests/auth.test.js`
- `backend/tests/works.test.js`
- `backend/tests/db.test.js`

## AI_LOG

### Herramienta usada

- Herramienta: Antigravity
- Modelo: Gemini 3.8 Flash
- Tipo: asistente de desarrollo

### Uso realizado

Se usó la IA para:

- planificar la transición de almacenamiento en memoria a PostgreSQL sin alterar los contratos REST;
- diseñar el esquema SQL inicial (`schema.sql`) para las tablas `users` y `works`;
- crear la capa de modelos (`userModel.js`, `workModel.js`) y el módulo de conexión `db.js`;
- actualizar los controladores y servicios a un flujo asíncrono con `async/await`;
- configurar fallback con `pg-mem` para ejecución autónoma de la batería de tests automáticos.

### Prompts importantes

- “te he dado ya la idea inicial para la iteración 3, completa el resto del documento de la iteración y voy viendo si me parece bien”
- “adelante”

### Resultado

La IA estructuró la iteración, implementó toda la capa de persistencia en PostgreSQL con soporte nativo de `pg`, configuró la compatibilidad de pruebas en memoria mediante `pg-mem` y verificó que los 14 tests automáticos superasen la ejecución sin errores.

### Decisión del estudiante

- Se aceptó la recomendación de usar el driver nativo `pg` junto con una arquitectura por repositorios/modelos en `src/models/`.
- Se acordó incluir un `docker-compose.yml` y un esquema `schema.sql` para desplegar la base de datos fácilmente en local o conectarla a Supabase mediante `DATABASE_URL`.
- Se mantuvo la compatibilidad total de los endpoints REST existentes para no romper ninguna funcionalidad previa.

### Correcciones manuales

- Se aseguró que `users` mantenga compatibilidad tanto con `name` (de las pruebas iniciales) como con `username` (definido en la arquitectura global).
- Se implementó la limpieza automática entre tests (`DELETE FROM users; DELETE FROM works;`) para garantizar el aislamiento de cada prueba.

## COMMITS RELACIONADOS

- "462ccefa8e712646fc10cee1ea0da893df5e8829"