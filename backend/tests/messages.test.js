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

test('POST /api/messages envía mensaje a otro usuario con datos válidos', async () => {
  const alice = await registerUser('Alice', 'alice@test.com');
  const bob = await registerUser('Bob', 'bob@test.com');

  const response = await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${alice.token}`)
    .send({
      receiver_id: bob.user.id,
      content: 'Hola Bob, ¿cómo estás?'
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.directMessage.sender_id, alice.user.id);
  assert.equal(response.body.directMessage.receiver_id, bob.user.id);
  assert.equal(response.body.directMessage.content, 'Hola Bob, ¿cómo estás?');
  assert.equal(response.body.directMessage.read, false);
});

test('POST /api/messages rechaza envío de mensaje a uno mismo', async () => {
  const alice = await registerUser('Alice', 'alice@test.com');

  const response = await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${alice.token}`)
    .send({
      receiver_id: alice.user.id,
      content: 'Mensaje para mí mismo'
    });

  assert.equal(response.status, 400);
});

test('POST /api/messages rechaza envío de mensaje con contenido vacío', async () => {
  const alice = await registerUser('Alice', 'alice@test.com');
  const bob = await registerUser('Bob', 'bob@test.com');

  const response = await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${alice.token}`)
    .send({
      receiver_id: bob.user.id,
      content: '   '
    });

  assert.equal(response.status, 400);
});

test('POST /api/messages rechaza envío a usuario inexistente', async () => {
  const alice = await registerUser('Alice', 'alice@test.com');

  const response = await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${alice.token}`)
    .send({
      receiver_id: '00000000-0000-4000-8000-000000000000',
      content: 'Hola a nadie'
    });

  assert.equal(response.status, 404);
});

test('POST /api/messages rechaza envío si el emisor ha bloqueado al destinatario', async () => {
  const alice = await registerUser('Alice', 'alice@test.com');
  const bob = await registerUser('Bob', 'bob@test.com');

  // Alice bloquea a Bob
  await request(app)
    .post(`/api/users/${bob.user.id}/relationships`)
    .set('Authorization', `Bearer ${alice.token}`)
    .send({ type: 'blocked' });

  // Alice intenta enviarle un mensaje a Bob
  const response = await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${alice.token}`)
    .send({
      receiver_id: bob.user.id,
      content: 'Mensaje post-bloqueo'
    });

  assert.equal(response.status, 403);
});

test('POST /api/messages rechaza envío si el destinatario ha bloqueado al emisor', async () => {
  const alice = await registerUser('Alice', 'alice@test.com');
  const bob = await registerUser('Bob', 'bob@test.com');

  // Bob bloquea a Alice
  await request(app)
    .post(`/api/users/${alice.user.id}/relationships`)
    .set('Authorization', `Bearer ${bob.token}`)
    .send({ type: 'blocked' });

  // Alice intenta enviarle un mensaje a Bob
  const response = await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${alice.token}`)
    .send({
      receiver_id: bob.user.id,
      content: 'Hola Bob, ¿estás ahí?'
    });

  assert.equal(response.status, 403);
});

test('GET /api/messages/:targetUserId obtiene conversación cronológica entre dos usuarios', async () => {
  const alice = await registerUser('Alice', 'alice@test.com');
  const bob = await registerUser('Bob', 'bob@test.com');

  await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${alice.token}`)
    .send({ receiver_id: bob.user.id, content: 'Primer mensaje de Alice' });

  await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${bob.token}`)
    .send({ receiver_id: alice.user.id, content: 'Respuesta de Bob' });

  const response = await request(app)
    .get(`/api/messages/${bob.user.id}`)
    .set('Authorization', `Bearer ${alice.token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.messages.length, 2);
  assert.equal(response.body.messages[0].content, 'Primer mensaje de Alice');
  assert.equal(response.body.messages[1].content, 'Respuesta de Bob');
});

test('GET /api/messages/conversations lista conversaciones activas del usuario autenticado', async () => {
  const alice = await registerUser('Alice', 'alice@test.com');
  const bob = await registerUser('Bob', 'bob@test.com');
  const carlos = await registerUser('Carlos', 'carlos@test.com');

  await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${alice.token}`)
    .send({ receiver_id: bob.user.id, content: 'Hola Bob' });

  await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${alice.token}`)
    .send({ receiver_id: carlos.user.id, content: 'Hola Carlos' });

  const response = await request(app)
    .get('/api/messages/conversations')
    .set('Authorization', `Bearer ${alice.token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.conversations.length, 2);
  assert.ok(response.body.conversations.some((c) => c.other_user_id === bob.user.id));
  assert.ok(response.body.conversations.some((c) => c.other_user_id === carlos.user.id));
});

test('PATCH /api/messages/:id/read marca como leído un mensaje recibido', async () => {
  const alice = await registerUser('Alice', 'alice@test.com');
  const bob = await registerUser('Bob', 'bob@test.com');

  const sendRes = await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${alice.token}`)
    .send({ receiver_id: bob.user.id, content: 'Mensaje para Bob' });

  const msgId = sendRes.body.directMessage.id;

  // Bob lo marca como leído
  const patchRes = await request(app)
    .patch(`/api/messages/${msgId}/read`)
    .set('Authorization', `Bearer ${bob.token}`);

  assert.equal(patchRes.status, 200);
  assert.equal(patchRes.body.directMessage.read, true);
});

test('PATCH /api/messages/:id/read rechaza marcar como leído un mensaje que no fue recibido por el usuario', async () => {
  const alice = await registerUser('Alice', 'alice@test.com');
  const bob = await registerUser('Bob', 'bob@test.com');
  const eve = await registerUser('Eve', 'eve@test.com');

  const sendRes = await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${alice.token}`)
    .send({ receiver_id: bob.user.id, content: 'Mensaje privado para Bob' });

  const msgId = sendRes.body.directMessage.id;

  // Eve intenta marcarlo como leído
  const patchRes = await request(app)
    .patch(`/api/messages/${msgId}/read`)
    .set('Authorization', `Bearer ${eve.token}`);

  assert.equal(patchRes.status, 403);
});

test('Rutas de mensajes devuelven 401 si no hay token', async () => {
  const resGet = await request(app).get('/api/messages/conversations');
  assert.equal(resGet.status, 401);

  const resPost = await request(app).post('/api/messages').send({ content: 'test' });
  assert.equal(resPost.status, 401);
});
