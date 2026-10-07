const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../src/app');
const { resetUsers } = require('../src/data/store');

test.beforeEach(() => {
  resetUsers();
});

test('POST /api/auth/register crea un usuario correctamente', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Ana',
      email: 'ana@test.com',
      password: '12345678'
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.user.email, 'ana@test.com');
  assert.equal(response.body.user.name, 'Ana');
  assert.ok(response.body.user.id);
});

test('POST /api/auth/register rechaza emails duplicados', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Ana',
      email: 'ana@test.com',
      password: '12345678'
    });

  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Ana 2',
      email: 'ana@test.com',
      password: '87654321'
    });

  assert.equal(response.status, 409);
  assert.match(response.body.message, /ya existe/i);
});

test('POST /api/auth/login devuelve token para credenciales válidas', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Ana',
      email: 'ana@test.com',
      password: '12345678'
    });

  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'ana@test.com',
      password: '12345678'
    });

  assert.equal(response.status, 200);
  assert.ok(response.body.token);
  assert.equal(response.body.user.email, 'ana@test.com');
});

test('POST /api/auth/login rechaza contraseña incorrecta', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Ana',
      email: 'ana@test.com',
      password: '12345678'
    });

  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'ana@test.com',
      password: 'wrongpass'
    });

  assert.equal(response.status, 401);
  assert.match(response.body.message, /credenciales|incorrectas/i);
});

test('GET /api/auth/me requiere token válido', async () => {
  const response = await request(app)
    .get('/api/auth/me')
    .set('Authorization', 'Bearer token-invalido');

  assert.equal(response.status, 401);
  assert.match(response.body.message, /token|inválido|expirado/i);
});
