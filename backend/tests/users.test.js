const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../src/app');
const { cleanDb } = require('../src/config/db');

test.beforeEach(async () => {
  await cleanDb();
});

const registerUser = async (name, email) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password: 'password123' });
  return {
    user: res.body.user,
    token: res.body.token || (
      await request(app).post('/api/auth/login').send({ email, password: 'password123' })
    ).body.token
  };
};

test('GET /api/users lista usuarios globalmente sin exponer contraseñas', async () => {
  await registerUser('Alice', 'alice@test.com');
  await registerUser('Bob', 'bob@test.com');

  const response = await request(app).get('/api/users');

  assert.equal(response.status, 200);
  assert.equal(response.body.users.length, 2);
  assert.ok(response.body.users.every((u) => u.password_hash === undefined));
  assert.ok(response.body.users.some((u) => u.username === 'Alice'));
});

test('GET /api/users busca usuarios por coincidencia de nombre', async () => {
  await registerUser('Carlos Santana', 'carlos@test.com');
  await registerUser('Daniela', 'daniela@test.com');

  const response = await request(app).get('/api/users?search=carlos');

  assert.equal(response.status, 200);
  assert.equal(response.body.users.length, 1);
  assert.equal(response.body.users[0].username, 'Carlos Santana');
});

test('GET /api/users/:id obtiene detalle de perfil de usuario existente', async () => {
  const { user } = await registerUser('Elena', 'elena@test.com');

  const response = await request(app).get(`/api/users/${user.id}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.user.username, 'Elena');
  assert.equal(response.body.user.id, user.id);
  assert.equal(response.body.user.password_hash, undefined);
});

test('GET /api/users/:id devuelve 404 para usuario inexistente', async () => {
  const response = await request(app).get('/api/users/00000000-0000-4000-8000-000000000000');

  assert.equal(response.status, 404);
  assert.match(response.body.message, /no encontrado/i);
});

test('POST /api/users/:id/relationships agrega contacto/amigo por usuario autenticado', async () => {
  const user1 = await registerUser('User1', 'u1@test.com');
  const user2 = await registerUser('User2', 'u2@test.com');

  const response = await request(app)
    .post(`/api/users/${user2.user.id}/relationships`)
    .set('Authorization', `Bearer ${user1.token}`)
    .send({ type: 'friend' });

  assert.equal(response.status, 201);
  assert.equal(response.body.relationship.type, 'friend');
  assert.equal(response.body.relationship.target_user_id, user2.user.id);
  assert.equal(response.body.relationship.user_id, user1.user.id);
});

test('POST /api/users/:id/relationships bloquea usuario por usuario autenticado', async () => {
  const user1 = await registerUser('UserA', 'ua@test.com');
  const user2 = await registerUser('UserB', 'ub@test.com');

  const response = await request(app)
    .post(`/api/users/${user2.user.id}/relationships`)
    .set('Authorization', `Bearer ${user1.token}`)
    .send({ type: 'blocked' });

  assert.equal(response.status, 201);
  assert.equal(response.body.relationship.type, 'blocked');
});

test('POST /api/users/:id/relationships actualiza relación existente de amigo a bloqueado', async () => {
  const user1 = await registerUser('UserX', 'ux@test.com');
  const user2 = await registerUser('UserY', 'uy@test.com');

  await request(app)
    .post(`/api/users/${user2.user.id}/relationships`)
    .set('Authorization', `Bearer ${user1.token}`)
    .send({ type: 'friend' });

  const updateResponse = await request(app)
    .post(`/api/users/${user2.user.id}/relationships`)
    .set('Authorization', `Bearer ${user1.token}`)
    .send({ type: 'blocked' });

  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.body.relationship.type, 'blocked');
});

test('POST /api/users/:id/relationships rechaza auto-relación', async () => {
  const user = await registerUser('Self', 'self@test.com');

  const response = await request(app)
    .post(`/api/users/${user.user.id}/relationships`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ type: 'friend' });

  assert.equal(response.status, 400);
  assert.match(response.body.message, /contigo mismo/i);
});

test('POST /api/users/:id/relationships rechaza relación con usuario inexistente', async () => {
  const user = await registerUser('ActiveUser', 'active@test.com');

  const response = await request(app)
    .post('/api/users/00000000-0000-4000-8000-000000000000/relationships')
    .set('Authorization', `Bearer ${user.token}`)
    .send({ type: 'friend' });

  assert.equal(response.status, 404);
  assert.match(response.body.message, /no existe/i);
});

test('POST /api/users/:id/relationships rechaza tipo inválido', async () => {
  const user1 = await registerUser('UserT1', 'ut1@test.com');
  const user2 = await registerUser('UserT2', 'ut2@test.com');

  const response = await request(app)
    .post(`/api/users/${user2.user.id}/relationships`)
    .set('Authorization', `Bearer ${user1.token}`)
    .send({ type: 'invalid_type' });

  assert.equal(response.status, 400);
  assert.match(response.body.message, /friend.*blocked/i);
});

test('DELETE /api/users/:id/relationships elimina relación existente', async () => {
  const user1 = await registerUser('UserD1', 'ud1@test.com');
  const user2 = await registerUser('UserD2', 'ud2@test.com');

  await request(app)
    .post(`/api/users/${user2.user.id}/relationships`)
    .set('Authorization', `Bearer ${user1.token}`)
    .send({ type: 'friend' });

  const deleteResponse = await request(app)
    .delete(`/api/users/${user2.user.id}/relationships`)
    .set('Authorization', `Bearer ${user1.token}`);

  assert.equal(deleteResponse.status, 200);
  assert.match(deleteResponse.body.message, /eliminada/i);
});

test('POST /api/users/:id/relationships rechaza gestión sin autenticación', async () => {
  const user = await registerUser('Target', 'target@test.com');

  const response = await request(app)
    .post(`/api/users/${user.user.id}/relationships`)
    .send({ type: 'friend' });

  assert.equal(response.status, 401);
  assert.match(response.body.message, /token/i);
});

test('PUT /api/auth/me actualiza perfil propio con datos válidos', async () => {
  const { token, user } = await registerUser('OriginalName', 'original@test.com');

  const response = await request(app)
    .put('/api/auth/me')
    .set('Authorization', `Bearer ${token}`)
    .send({
      username: 'UpdatedName',
      bio: 'Amante de la ciencia ficción y fantasía.',
      avatar_url: 'https://example.com/avatar.png'
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.user.username, 'UpdatedName');
  assert.equal(response.body.user.bio, 'Amante de la ciencia ficción y fantasía.');
  assert.equal(response.body.user.avatar_url, 'https://example.com/avatar.png');

  // Comprobar que GET /api/users/:id refleja los cambios
  const getProfile = await request(app).get(`/api/users/${user.id}`);
  assert.equal(getProfile.status, 200);
  assert.equal(getProfile.body.user.username, 'UpdatedName');
  assert.equal(getProfile.body.user.bio, 'Amante de la ciencia ficción y fantasía.');
});

test('PUT /api/users/me permite actualizar perfil mediante alias', async () => {
  const { token } = await registerUser('UserAlias', 'alias@test.com');

  const response = await request(app)
    .put('/api/users/me')
    .set('Authorization', `Bearer ${token}`)
    .send({ bio: 'Nueva biografía vía alias' });

  assert.equal(response.status, 200);
  assert.equal(response.body.user.bio, 'Nueva biografía vía alias');
});

test('PUT /api/auth/me rechaza actualización con nombre de usuario vacío', async () => {
  const { token } = await registerUser('ValidUser', 'valid@test.com');

  const response = await request(app)
    .put('/api/auth/me')
    .set('Authorization', `Bearer ${token}`)
    .send({ username: '   ' });

  assert.equal(response.status, 400);
});

test('PUT /api/auth/me rechaza actualización con nombre de usuario ya en uso', async () => {
  await registerUser('ExistingUser', 'existing@test.com');
  const user2 = await registerUser('SecondUser', 'second@test.com');

  const response = await request(app)
    .put('/api/auth/me')
    .set('Authorization', `Bearer ${user2.token}`)
    .send({ username: 'ExistingUser' });

  assert.equal(response.status, 409);
  assert.match(response.body.message, /ya existe/i);
});

test('PUT /api/users/:id rechaza modificación de perfil ajeno', async () => {
  const user1 = await registerUser('Victim', 'victim@test.com');
  const user2 = await registerUser('Attacker', 'attacker@test.com');

  const response = await request(app)
    .put(`/api/users/${user1.user.id}`)
    .set('Authorization', `Bearer ${user2.token}`)
    .send({ bio: 'Hackeado' });

  assert.equal(response.status, 403);
  assert.match(response.body.message, /permiso/i);
});

test('PUT /api/auth/me rechaza modificación sin autenticación', async () => {
  const response = await request(app)
    .put('/api/auth/me')
    .send({ bio: 'Anónimo' });

  assert.equal(response.status, 401);
});

test('GET /api/users pagina el listado de usuarios con metadatos de navegación', async () => {
  await registerUser('UserA', 'usera@test.com');
  await registerUser('UserB', 'userb@test.com');
  await registerUser('UserC', 'userc@test.com');

  const page1 = await request(app).get('/api/users?page=1&limit=2');
  assert.equal(page1.status, 200);
  assert.equal(page1.body.users.length, 2);
  assert.equal(page1.body.pagination.total, 3);
  assert.equal(page1.body.pagination.page, 1);
  assert.equal(page1.body.pagination.limit, 2);
  assert.equal(page1.body.pagination.totalPages, 2);

  const page2 = await request(app).get('/api/users?page=2&limit=2');
  assert.equal(page2.status, 200);
  assert.equal(page2.body.users.length, 1);
  assert.equal(page2.body.pagination.page, 2);
});
