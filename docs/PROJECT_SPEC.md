# PROJECT_SPEC

## Descripción

Se va a desarrollar una plataforma web comunitaria orientada a la discusión, intercambio de opiniones y debate en torno a obras de ficción de diversos formatos (libros, películas, series de televisión, etc.). 

La aplicación resuelve la dispersión de comunidades de aficionados al centralizar en un único punto de encuentro la catalogación de obras ficticias con hilos de debate organizados, permitiendo a los usuarios descubrir títulos según sus intereses y participar en conversaciones públicas o privadas con otros apasionados de la ficción.

## Tipos de usuarios

- **Usuario no autenticado (Visitante):** Puede explorar la plataforma en modo lectura, buscando obras, debates abiertos y perfiles de usuarios públicos.
- **Usuario autenticado (Miembro):** Cuenta con un perfil registrado que le permite crear y participar activamente en debates, interactuar socialmente con otros miembros (gestionar contactos y bloqueos), mantener mensajería privada directa y suscribirse a notificaciones de actividad.

## Recurso principal

- **Debate:** Espacio de discusión temático asociado a una obra de ficción específica donde los usuarios intercambian comentarios, análisis y opiniones.
- **Obra:** Elemento de ficción de referencia (libro, película, serie) sobre el cual pivotan las conversaciones y búsquedas.

## Recursos secundarios

- **Usuario:** Perfil individual con credenciales, historial de actividad y preferencias de relación.
- **Comentario / Mensaje de debate:** Cada una de las intervenciones publicadas por los miembros dentro de un debate.
- **Conversación privada / Mensaje directo:** Espacio y mensajes de comunicación privada uno a uno entre dos usuarios.
- **Suscripción de notificación:** Vínculo de seguimiento entre un usuario y un debate para alertar de nueva actividad.
- **Relación social:** Conexiones interpersonales entre usuarios (contactos/amigos y usuarios bloqueados).
- **Atributos de clasificación de obra:** Metadatos como tipo de obra (película, serie, libro), temática/género, año de lanzamiento, duración, etc.

## Relación entre recursos

- **Obra y Debate:** Una obra puede tener múltiples debates asociados; cada debate pertenece a una única obra.
- **Debate y Comentario:** Un debate contiene muchos comentarios; cada comentario pertenece a un único debate y a un único usuario autor.
- **Usuario y Debate:** Un usuario puede crear múltiples debates y suscribirse a alertas en varios de ellos (relación muchos a muchos a través de la suscripción).
- **Usuario y Usuario (Relaciones sociales):** Un usuario puede agregar o bloquear a múltiples usuarios (relaciones bidireccionales o unidireccionales de amistad o bloqueo).
- **Usuario y Mensajería privada:** Dos usuarios participan en una conversación privada que contiene un historial cronológico de mensajes directos.

## Funcionalidades principales

### Gestión y exploración de obras y debates
- Búsqueda y filtrado avanzado de obras por título, tipo de obra, temática/género, año de publicación o duración.
- Consulta del catálogo de obras y visualización de debates asociados.
- Creación de nuevos debates vinculados a una obra ficticia.
- Publicación, visualización y seguimiento cronológico de comentarios dentro de un debate.

### Interacción y comunidad
- Búsqueda y visualización de perfiles públicos de usuarios.
- Gestión de red de contactos (agregar amigos y bloquear usuarios no deseados para restringir interacción).
- Mensajería instantánea privada entre usuarios.
- Sistema de suscripción y recepción de notificaciones de nuevos comentarios en debates seleccionados.

## Fuera de alcance

- Sistema de puntuación o reseñas numéricas formales (estilo agregador de críticas como Metacritic o IMDb).
- Algoritmos de recomendación automatizada basados en inteligencia artificial o aprendizaje automático.
- Reproducción o streaming multimedia y lectura directa de libros dentro de la plataforma.
- Chats grupales privados (la mensajería privada se limita a conversaciones individuales entre dos usuarios).
- Moderación automatizada de contenido mediante filtros de lenguaje natural avanzados (se gestionará mediante herramientas básicas de reporte/bloqueo de usuarios).
