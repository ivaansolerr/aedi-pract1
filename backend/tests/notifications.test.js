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

const createWork = async () => {
  const res = await request(app)
    .post('/api/works')
    .send({
      title: 'Dune',
      type: 'book',
      genre: 'Ciencia Ficción',
      release_year: 1965,
      duration: '412 páginas',
      synopsis: 'Novela de Frank Herbert ambientada en Arrakis.'
    });
  return res.body.work;
};

const createDebate = async (token, workId) => {
  const res = await request(app)
    .post(`/api/works/${workId}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: '¿Es Paul Atreides un héroe?',
      description: 'Análisis del viaje del héroe en Dune.'
    });
  return res.body.debate;
};

test('POST /api/debates/:id/subscribe suscribe a un usuario autenticado a un debate', async () => {
  const user = await registerUser('Alice', 'alice@test.com');
  const work = await createWork();
  const debate = await createDebate(user.token, work.id);

  const subscriber = await registerUser('Bob', 'bob@test.com');

  const response = await request(app)
    .post(`/api/debates/${debate.id}/subscribe`)
    .set('Authorization', `Bearer ${subscriber.token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.subscribed, true);
});

test('POST /api/debates/:id/subscribe desuscribe a un usuario si ya estaba suscrito (toggle)', async () => {
  const user = await registerUser('Alice', 'alice@test.com');
  const work = await createWork();
  const debate = await createDebate(user.token, work.id);
  const subscriber = await registerUser('Bob', 'bob@test.com');

  // Primera llamada: se suscribe
  await request(app)
    .post(`/api/debates/${debate.id}/subscribe`)
    .set('Authorization', `Bearer ${subscriber.token}`);

  // Segunda llamada: se desuscribe
  const response = await request(app)
    .post(`/api/debates/${debate.id}/subscribe`)
    .set('Authorization', `Bearer ${subscriber.token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.subscribed, false);
});

test('POST /api/debates/:id/subscribe devuelve 401 si no se envía token', async () => {
  const user = await registerUser('Alice', 'alice@test.com');
  const work = await createWork();
  const debate = await createDebate(user.token, work.id);

  const response = await request(app)
    .post(`/api/debates/${debate.id}/subscribe`);

  assert.equal(response.status, 401);
});

test('POST /api/debates/:id/subscribe devuelve 404 para un debate inexistente', async () => {
  const user = await registerUser('Alice', 'alice@test.com');

  const response = await request(app)
    .post('/api/debates/00000000-0000-4000-8000-000000000000/subscribe')
    .set('Authorization', `Bearer ${user.token}`);

  assert.equal(response.status, 404);
});

test('Publicar un comentario genera notificación para los usuarios suscritos', async () => {
  const creator = await registerUser('Alice', 'alice@test.com');
  const subscriber = await registerUser('Bob', 'bob@test.com');
  const commenter = await registerUser('Carlos', 'carlos@test.com');

  const work = await createWork();
  const debate = await createDebate(creator.token, work.id);

  // Bob se suscribe al debate
  await request(app)
    .post(`/api/debates/${debate.id}/subscribe`)
    .set('Authorization', `Bearer ${subscriber.token}`);

  // Carlos publica un comentario
  const commentRes = await request(app)
    .post(`/api/debates/${debate.id}/comments`)
    .set('Authorization', `Bearer ${commenter.token}`)
    .send({ content: 'Excelente tema de debate.' });

  assert.equal(commentRes.status, 201);

  // Bob consulta sus notificaciones
  const notifRes = await request(app)
    .get('/api/notifications')
    .set('Authorization', `Bearer ${subscriber.token}`);

  assert.equal(notifRes.status, 200);
  assert.equal(notifRes.body.notifications.length, 1);
  assert.equal(notifRes.body.notifications[0].debate_id, debate.id);
  assert.equal(notifRes.body.notifications[0].comment_id, commentRes.body.comment.id);
  assert.equal(notifRes.body.notifications[0].is_read, false);
});

test('Publicar un comentario NO genera notificación para el propio autor del comentario', async () => {
  const user = await registerUser('Alice', 'alice@test.com');
  const work = await createWork();
  const debate = await createDebate(user.token, work.id);

  // Alice se suscribe a su propio debate
  await request(app)
    .post(`/api/debates/${debate.id}/subscribe`)
    .set('Authorization', `Bearer ${user.token}`);

  // Alice publica un comentario
  await request(app)
    .post(`/api/debates/${debate.id}/comments`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ content: 'Mi propio comentario en mi debate.' });

  // Alice no debe recibir notificación de su propia acción
  const notifRes = await request(app)
    .get('/api/notifications')
    .set('Authorization', `Bearer ${user.token}`);

  assert.equal(notifRes.status, 200);
  assert.equal(notifRes.body.notifications.length, 0);
});

test('GET /api/notifications lista notificaciones del usuario autenticado', async () => {
  const creator = await registerUser('Alice', 'alice@test.com');
  const subscriber = await registerUser('Bob', 'bob@test.com');
  const commenter = await registerUser('Carlos', 'carlos@test.com');

  const work = await createWork();
  const debate = await createDebate(creator.token, work.id);

  await request(app)
    .post(`/api/debates/${debate.id}/subscribe`)
    .set('Authorization', `Bearer ${subscriber.token}`);

  await request(app)
    .post(`/api/debates/${debate.id}/comments`)
    .set('Authorization', `Bearer ${commenter.token}`)
    .send({ content: 'Primer comentario.' });

  await request(app)
    .post(`/api/debates/${debate.id}/comments`)
    .set('Authorization', `Bearer ${commenter.token}`)
    .send({ content: 'Segundo comentario.' });

  const res = await request(app)
    .get('/api/notifications')
    .set('Authorization', `Bearer ${subscriber.token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.notifications.length, 2);
  assert.ok(res.body.notifications.every((n) => n.user_id === subscriber.user.id));
});

test('GET /api/notifications devuelve 401 sin autenticación', async () => {
  const response = await request(app).get('/api/notifications');
  assert.equal(response.status, 401);
});

test('PATCH /api/notifications/:id/read marca una notificación propia como leída', async () => {
  const creator = await registerUser('Alice', 'alice@test.com');
  const subscriber = await registerUser('Bob', 'bob@test.com');
  const commenter = await registerUser('Carlos', 'carlos@test.com');

  const work = await createWork();
  const debate = await createDebate(creator.token, work.id);

  await request(app)
    .post(`/api/debates/${debate.id}/subscribe`)
    .set('Authorization', `Bearer ${subscriber.token}`);

  await request(app)
    .post(`/api/debates/${debate.id}/comments`)
    .set('Authorization', `Bearer ${commenter.token}`)
    .send({ content: 'Comentario de prueba.' });

  const listRes = await request(app)
    .get('/api/notifications')
    .set('Authorization', `Bearer ${subscriber.token}`);

  const notifId = listRes.body.notifications[0].id;

  const patchRes = await request(app)
    .patch(`/api/notifications/${notifId}/read`)
    .set('Authorization', `Bearer ${subscriber.token}`);

  assert.equal(patchRes.status, 200);
  assert.equal(patchRes.body.notification.is_read, true);

  // Comprobar que en el listado ahora aparece leída
  const updatedList = await request(app)
    .get('/api/notifications')
    .set('Authorization', `Bearer ${subscriber.token}`);

  assert.equal(updatedList.body.notifications[0].is_read, true);
});

test('PATCH /api/notifications/:id/read devuelve 404 para una notificación inexistente', async () => {
  const user = await registerUser('Alice', 'alice@test.com');

  const response = await request(app)
    .patch('/api/notifications/00000000-0000-4000-8000-000000000000/read')
    .set('Authorization', `Bearer ${user.token}`);

  assert.equal(response.status, 404);
});

test('PATCH /api/notifications/:id/read devuelve 403 al intentar marcar notificación de otro usuario', async () => {
  const creator = await registerUser('Alice', 'alice@test.com');
  const subscriber = await registerUser('Bob', 'bob@test.com');
  const commenter = await registerUser('Carlos', 'carlos@test.com');
  const intruder = await registerUser('Eve', 'eve@test.com');

  const work = await createWork();
  const debate = await createDebate(creator.token, work.id);

  await request(app)
    .post(`/api/debates/${debate.id}/subscribe`)
    .set('Authorization', `Bearer ${subscriber.token}`);

  await request(app)
    .post(`/api/debates/${debate.id}/comments`)
    .set('Authorization', `Bearer ${commenter.token}`)
    .send({ content: 'Comentario.' });

  const listRes = await request(app)
    .get('/api/notifications')
    .set('Authorization', `Bearer ${subscriber.token}`);

  const notifId = listRes.body.notifications[0].id;

  // Eve intenta marcar la notificación de Bob
  const patchRes = await request(app)
    .patch(`/api/notifications/${notifId}/read`)
    .set('Authorization', `Bearer ${intruder.token}`);

  assert.equal(patchRes.status, 403);
});
