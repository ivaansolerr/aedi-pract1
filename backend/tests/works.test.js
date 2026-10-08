const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../src/app');
const { resetUsers, resetWorks } = require('../src/data/store');

test.beforeEach(() => {
  resetUsers();
  resetWorks();
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
