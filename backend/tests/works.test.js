const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../src/app');
const { cleanDb } = require('../src/config/db');

test.beforeEach(async () => {
  await cleanDb();
});

test('POST /api/works crea una obra con datos válidos', async () => {
  const response = await request(app)
    .post('/api/works')
    .send({
      title: 'Dune',
      type: 'book',
      genre: 'Sci-Fi',
      release_year: 1965,
      duration: '412 páginas',
      synopsis: 'Una epopeya espacial en un planeta desértico.'
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.work.title, 'Dune');
  assert.equal(response.body.work.type, 'book');
  assert.ok(response.body.work.id);
});

test('POST /api/works rechaza una obra sin título', async () => {
  const response = await request(app)
    .post('/api/works')
    .send({
      type: 'movie',
      genre: 'Drama',
      release_year: 2020,
      duration: '120 min',
      synopsis: 'Sinopsis de prueba'
    });

  assert.equal(response.status, 400);
  assert.match(response.body.message, /título/i);
});

test('GET /api/works devuelve lista vacía si no hay obras', async () => {
  const response = await request(app).get('/api/works');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.works, []);
});

test('GET /api/works devuelve todas las obras', async () => {
  await request(app)
    .post('/api/works')
    .send({
      title: 'Blade Runner',
      type: 'movie',
      genre: 'Sci-Fi',
      release_year: 1982,
      duration: '117 min',
      synopsis: 'Un detective investiga un caso complicado.'
    });

  await request(app)
    .post('/api/works')
    .send({
      title: 'The Left Hand of Darkness',
      type: 'book',
      genre: 'Fiction',
      release_year: 1969,
      duration: '304 páginas',
      synopsis: 'Un tratado de sociología alienígena.'
    });

  const response = await request(app).get('/api/works');

  assert.equal(response.status, 200);
  assert.equal(response.body.works.length, 2);
  assert.ok(response.body.works.some((work) => work.title === 'Blade Runner'));
});

test('GET /api/works/:id devuelve una obra existente', async () => {
  const createResponse = await request(app)
    .post('/api/works')
    .send({
      title: 'The Matrix',
      type: 'movie',
      genre: 'Sci-Fi',
      release_year: 1999,
      duration: '136 min',
      synopsis: 'La realidad es una simulación.'
    });

  const response = await request(app).get(`/api/works/${createResponse.body.work.id}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.work.title, 'The Matrix');
});

test('GET /api/works/:id devuelve 404 si no existe', async () => {
  const response = await request(app).get('/api/works/99999999-9999-4999-9999-999999999999');

  assert.equal(response.status, 404);
  assert.match(response.body.message, /no existe|no encontrada/i);
});

test('GET /api/works filtra por título con coincidencia parcial', async () => {
  await request(app).post('/api/works').send({
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    type: 'book',
    genre: 'Fantasy',
    release_year: 1954,
    duration: '423 páginas',
    synopsis: 'Fantasía épica.'
  });

  await request(app).post('/api/works').send({
    title: 'The Matrix',
    type: 'movie',
    genre: 'Sci-Fi',
    release_year: 1999,
    duration: '136 min',
    synopsis: 'Ciencia ficción.'
  });

  const response = await request(app).get('/api/works?title=fellowship');

  assert.equal(response.status, 200);
  assert.equal(response.body.works.length, 1);
  assert.match(response.body.works[0].title, /Fellowship/i);
});

test('GET /api/works filtra por tipo de obra', async () => {
  await request(app).post('/api/works').send({
    title: 'Inception',
    type: 'movie',
    genre: 'Sci-Fi',
    release_year: 2010,
    duration: '148 min',
    synopsis: 'Espionaje onírico.'
  });

  await request(app).post('/api/works').send({
    title: 'Neuromancer',
    type: 'book',
    genre: 'Sci-Fi',
    release_year: 1984,
    duration: '271 páginas',
    synopsis: 'Cyberpunk clásico.'
  });

  const response = await request(app).get('/api/works?type=movie');

  assert.equal(response.status, 200);
  assert.equal(response.body.works.length, 1);
  assert.equal(response.body.works[0].title, 'Inception');
});

test('GET /api/works filtra por género', async () => {
  await request(app).post('/api/works').send({
    title: 'El Resplandor',
    type: 'book',
    genre: 'Terror',
    release_year: 1977,
    duration: '447 páginas',
    synopsis: 'Terror psicológico.'
  });

  await request(app).post('/api/works').send({
    title: 'Interstellar',
    type: 'movie',
    genre: 'Sci-Fi',
    release_year: 2014,
    duration: '169 min',
    synopsis: 'Exploración espacial.'
  });

  const response = await request(app).get('/api/works?genre=terror');

  assert.equal(response.status, 200);
  assert.equal(response.body.works.length, 1);
  assert.equal(response.body.works[0].title, 'El Resplandor');
});

test('GET /api/works filtra por año de lanzamiento', async () => {
  await request(app).post('/api/works').send({
    title: 'Obra 1999',
    type: 'movie',
    genre: 'Sci-Fi',
    release_year: 1999,
    duration: '120 min',
    synopsis: 'Año 1999.'
  });

  await request(app).post('/api/works').send({
    title: 'Obra 2021',
    type: 'movie',
    genre: 'Sci-Fi',
    release_year: 2021,
    duration: '120 min',
    synopsis: 'Año 2021.'
  });

  const response = await request(app).get('/api/works?release_year=1999');

  assert.equal(response.status, 200);
  assert.equal(response.body.works.length, 1);
  assert.equal(response.body.works[0].title, 'Obra 1999');
});

test('GET /api/works combina múltiples filtros simultáneos', async () => {
  await request(app).post('/api/works').send({
    title: 'Dune: Part One',
    type: 'movie',
    genre: 'Sci-Fi',
    release_year: 2021,
    duration: '155 min',
    synopsis: 'Película en Arrakis.'
  });

  await request(app).post('/api/works').send({
    title: 'Dune',
    type: 'book',
    genre: 'Sci-Fi',
    release_year: 1965,
    duration: '412 páginas',
    synopsis: 'Novela original.'
  });

  const response = await request(app).get('/api/works?type=movie&genre=sci-fi&release_year=2021');

  assert.equal(response.status, 200);
  assert.equal(response.body.works.length, 1);
  assert.equal(response.body.works[0].title, 'Dune: Part One');
});

test('GET /api/works devuelve array vacío si ningún resultado coincide', async () => {
  await request(app).post('/api/works').send({
    title: 'Obra Existente',
    type: 'movie',
    genre: 'Acción',
    release_year: 2020,
    duration: '100 min',
    synopsis: 'Sinopsis.'
  });

  const response = await request(app).get('/api/works?title=NoExisteNadaConEsteTitulo');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.works, []);
});

test('GET /api/works/:id incluye los debates asociados a la obra', async () => {
  // Crear obra
  const workRes = await request(app).post('/api/works').send({
    title: 'Solaris',
    type: 'book',
    genre: 'Sci-Fi',
    release_year: 1961,
    duration: '204 páginas',
    synopsis: 'Misterio en el planeta Solaris.'
  });
  const workId = workRes.body.work.id;

  // Registrar y autenticar usuario
  await request(app).post('/api/auth/register').send({
    name: 'Stanislaw',
    email: 'stanislaw@test.com',
    password: 'password123'
  });
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'stanislaw@test.com',
    password: 'password123'
  });
  const token = loginRes.body.token;

  // Crear debate sobre la obra
  const debateRes = await request(app)
    .post(`/api/works/${workId}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'El océano consciente',
      description: '¿Puede la humanidad comunicarse con Solaris?'
    });

  // Consultar ficha de la obra
  const response = await request(app).get(`/api/works/${workId}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.work.id, workId);
  assert.ok(Array.isArray(response.body.work.debates));
  assert.equal(response.body.work.debates.length, 1);
  assert.equal(response.body.work.debates[0].id, debateRes.body.debate.id);
  assert.equal(response.body.work.debates[0].title, 'El océano consciente');
});

test('PUT /api/works/:id modifica una obra existente', async () => {
  await request(app).post('/api/auth/register').send({
    name: 'AdminUser',
    email: 'admin@test.com',
    password: 'password123'
  });
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com',
    password: 'password123'
  });
  const token = loginRes.body.token;

  const createRes = await request(app).post('/api/works').send({
    title: 'Obra Previa',
    type: 'book',
    genre: 'Drama',
    release_year: 2000,
    duration: '300 páginas',
    synopsis: 'Sinopsis original.'
  });
  const workId = createRes.body.work.id;

  const updateRes = await request(app)
    .put(`/api/works/${workId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Obra Modificada',
      type: 'book',
      genre: 'Drama / Suspense',
      release_year: 2001,
      duration: '320 páginas',
      synopsis: 'Sinopsis actualizada.'
    });

  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.work.title, 'Obra Modificada');
  assert.equal(updateRes.body.work.genre, 'Drama / Suspense');
  assert.equal(updateRes.body.work.release_year, 2001);
});

test('PUT /api/works/:id rechaza modificación sin autenticación', async () => {
  const updateRes = await request(app)
    .put('/api/works/00000000-0000-4000-8000-000000000000')
    .send({
      title: 'Título',
      type: 'book',
      genre: 'Drama',
      release_year: 2000,
      duration: '100 p',
      synopsis: 'Desc'
    });

  assert.equal(updateRes.status, 401);
});

test('DELETE /api/works/:id elimina una obra existente', async () => {
  await request(app).post('/api/auth/register').send({
    name: 'AdminUser2',
    email: 'admin2@test.com',
    password: 'password123'
  });
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'admin2@test.com',
    password: 'password123'
  });
  const token = loginRes.body.token;

  const createRes = await request(app).post('/api/works').send({
    title: 'Obra para borrar',
    type: 'movie',
    genre: 'Comedia',
    release_year: 2018,
    duration: '90 min',
    synopsis: 'Sinopsis.'
  });
  const workId = createRes.body.work.id;

  const deleteRes = await request(app)
    .delete(`/api/works/${workId}`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(deleteRes.status, 200);

  // Verificar que ya no existe
  const getRes = await request(app).get(`/api/works/${workId}`);
  assert.equal(getRes.status, 404);
});

test('DELETE /api/works/:id rechaza eliminación sin autenticación', async () => {
  const deleteRes = await request(app).delete('/api/works/00000000-0000-4000-8000-000000000000');
  assert.equal(deleteRes.status, 401);
});

const createTestWork = async ({ title, release_year = 2020, type = 'movie', genre = 'Sci-Fi' }) => {
  const res = await request(app).post('/api/works').send({
    title,
    type,
    genre,
    release_year,
    duration: '120 min',
    synopsis: 'Sinopsis'
  });
  return res.body.work;
};

test('GET /api/works pagina el catálogo de obras con metadatos de navegación', async () => {
  await createTestWork({ title: 'Obra Alfa', release_year: 2010 });
  await createTestWork({ title: 'Obra Beta', release_year: 2015 });
  await createTestWork({ title: 'Obra Gamma', release_year: 2020 });

  const page1 = await request(app).get('/api/works?page=1&limit=2');
  assert.equal(page1.status, 200);
  assert.equal(page1.body.works.length, 2);
  assert.equal(page1.body.pagination.total, 3);
  assert.equal(page1.body.pagination.page, 1);
  assert.equal(page1.body.pagination.limit, 2);
  assert.equal(page1.body.pagination.totalPages, 2);

  const page2 = await request(app).get('/api/works?page=2&limit=2');
  assert.equal(page2.status, 200);
  assert.equal(page2.body.works.length, 1);
  assert.equal(page2.body.pagination.page, 2);
});


