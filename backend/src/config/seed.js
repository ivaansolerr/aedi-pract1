const bcrypt = require('bcryptjs');
const { findUserByEmail, createUser } = require('../models/userModel');
const { findAllWorks, createWork } = require('../models/workModel');
const { createDebate } = require('../models/debateModel');

async function seedData() {
  try {
    // 1. Usuario demo para pruebas
    let user = await findUserByEmail('ana@test.com');
    if (!user) {
      const passwordHash = bcrypt.hashSync('12345678', 10);
      user = await createUser({
        username: 'ana',
        email: 'ana@test.com',
        password_hash: passwordHash
      });
      console.log('✅ [Seed] Usuario de prueba inicializado: ana@test.com / 12345678');
    }

    // 2. Obras iniciales de catálogo si la tabla está vacía
    const { works } = await findAllWorks({ page: 1, limit: 1 });
    if (!works || works.length === 0) {
      const sampleWorks = [
        {
          title: 'Blade Runner 2049',
          type: 'movie',
          genre: 'Ciencia Ficción',
          release_year: 2017,
          duration: '164 min',
          synopsis: 'Treinta años después de los eventos de la primera película, un nuevo Blade Runner, el oficial K de la policía de Los Ángeles, desentierra un secreto oculto durante mucho tiempo que tiene el potencial de sumergir a la sociedad en el caos.'
        },
        {
          title: 'El Señor de los Anillos: La Comunidad del Anillo',
          type: 'movie',
          genre: 'Fantasía',
          release_year: 2001,
          duration: '178 min',
          synopsis: 'Un tímido hobbit de la Comarca y ocho compañeros de distintas razas emprenden un épico viaje al Monte del Destino para destruir el Anillo Único y salvar a la Tierra Media de Sauron.'
        },
        {
          title: 'Breaking Bad',
          type: 'series',
          genre: 'Drama / Crimen',
          release_year: 2008,
          duration: '5 temporadas',
          synopsis: 'Un profesor de química de secundaria con cáncer inoperable se alía con un antiguo alumno para producir y traficar metanfetamina con el objetivo de asegurar el sustento económico de su familia.'
        },
        {
          title: 'Fundación',
          type: 'book',
          genre: 'Ciencia Ficción',
          release_year: 1951,
          duration: '255 páginas',
          synopsis: 'La obra fundamental de Isaac Asimov donde Hari Seldon desarrolla la psicohistoria, una ciencia matemática capaz de predecir el destino de la humanidad a escala galáctica.'
        },
        {
          title: 'The Matrix',
          type: 'movie',
          genre: 'Ciencia Ficción / Acción',
          release_year: 1999,
          duration: '136 min',
          synopsis: 'Thomas Anderson, un programador informático que opera bajo el alias Neo, descubre que el mundo en el que vive es una simulación virtual creada por inteligencias artificiales.'
        },
        {
          title: 'Dune',
          type: 'movie',
          genre: 'Ciencia Ficción',
          release_year: 2021,
          duration: '155 min',
          synopsis: 'Paul Atreides viaja al peligroso y desértico planeta Arrakis, el único lugar del cosmos donde se cosecha la especia Melange, la sustancia más valiosa de la galaxia.'
        },
        {
          title: '1984',
          type: 'book',
          genre: 'Distopía',
          release_year: 1949,
          duration: '328 páginas',
          synopsis: 'En una sociedad dominada por la vigilancia constante del Gran Hermano y la Policía del Pensamiento, Winston Smith intenta conservar su libertad individual y su memoria histórica.'
        }
      ];

      const createdWorks = [];
      for (const w of sampleWorks) {
        const created = await createWork(w);
        createdWorks.push(created);
      }
      console.log(`✅ [Seed] ${createdWorks.length} obras iniciales insertadas en el catálogo.`);

      // 3. Debate de ejemplo sobre la primera obra
      if (user && createdWorks.length > 0) {
        await createDebate({
          work_id: createdWorks[0].id,
          user_id: user.id,
          title: '¿Tiene K un alma real en su viaje como replicante?',
          description: 'El dilema ético y existencial de Blade Runner 2049 nos invita a reflexionar sobre si la empatía y el sacrificio son lo que verdaderamente definen la condición humana.'
        });
        console.log('✅ [Seed] Debate inicial creado para la obra "Blade Runner 2049".');
      }
    }
  } catch (err) {
    console.error('⚠️ [Seed] Error al inicializar datos:', err.message);
  }
}

module.exports = { seedData };

