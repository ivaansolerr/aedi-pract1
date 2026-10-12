const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../src/app');
const { cleanDb } = require('../src/config/db');

test.beforeEach(async () => {
  await cleanDb();
});

const getAuthToken = async (emailOrName = 'test@example.com', maybeEmail) => {
  const email = emailOrName.includes('@') ? emailOrName : (maybeEmail || 'test@example.com');
  const name = emailOrName.includes('@') ? emailOrName.split('@')[0] : emailOrName;
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password: 'password123' });
  return res.body.token || (
    await request(app).post('/api/auth/login').send({ email, password: 'password123' })
  ).body.token;
};

const createTestWork = async (title = 'Dune') => {
  const res = await request(app)
    .post('/api/works')
    .send({
      title,
      type: 'book',
      genre: 'Sci-Fi',
      release_year: 1965,
      duration: '412 páginas',
      synopsis: 'Epopeya de ciencia ficción.'
    });
  return res.body.work;
};

test('POST /api/works/:workId/debates crea debate con datos válidos por usuario autenticado', async () => {
  const token = await getAuthToken();
  const work = await createTestWork();

  const response = await request(app)
    .post(`/api/works/${work.id}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: '¿Es Paul Atreides un héroe o un villano?',
      description: 'Análisis del arco de personaje en la saga.'
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.debate.title, '¿Es Paul Atreides un héroe o un villano?');
  assert.equal(response.body.debate.work_id, work.id);
  assert.ok(response.body.debate.id);
  assert.ok(response.body.debate.user_id);
});

test('POST /api/works/:workId/debates rechaza creación sin autenticación', async () => {
  const work = await createTestWork();

  const response = await request(app)
    .post(`/api/works/${work.id}/debates`)
    .send({
      title: 'Debate anónimo',
      description: 'Sin token.'
    });

  assert.equal(response.status, 401);
  assert.match(response.body.message, /token/i);
});

test('POST /api/works/:workId/debates rechaza creación en obra inexistente', async () => {
  const token = await getAuthToken();

  const response = await request(app)
    .post('/api/works/00000000-0000-4000-8000-000000000000/debates')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Debate en obra fantasma',
      description: 'No debería crearse.'
    });

  assert.equal(response.status, 404);
  assert.match(response.body.message, /obra/i);
});

test('POST /api/works/:workId/debates rechaza debate con campos obligatorios vacíos', async () => {
  const token = await getAuthToken();
  const work = await createTestWork();

  const response = await request(app)
    .post(`/api/works/${work.id}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: '',
      description: ''
    });

  assert.equal(response.status, 400);
  assert.match(response.body.message, /título|obligatorio/i);
});

test('GET /api/debates lista debates globalmente', async () => {
  const token = await getAuthToken();
  const work1 = await createTestWork('Obra 1');
  const work2 = await createTestWork('Obra 2');

  await request(app)
    .post(`/api/works/${work1.id}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Debate 1', description: 'Desc 1' });

  await request(app)
    .post(`/api/works/${work2.id}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Debate 2', description: 'Desc 2' });

  const response = await request(app).get('/api/debates');

  assert.equal(response.status, 200);
  assert.equal(response.body.debates.length, 2);
  assert.ok(response.body.debates.some((d) => d.title === 'Debate 1'));
  assert.ok(response.body.debates.some((d) => d.title === 'Debate 2'));
});

test('GET /api/debates filtra debates por obra existente', async () => {
  const token = await getAuthToken();
  const work1 = await createTestWork('Obra A');
  const work2 = await createTestWork('Obra B');

  await request(app)
    .post(`/api/works/${work1.id}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Debate sobre A', description: 'Desc A' });

  await request(app)
    .post(`/api/works/${work2.id}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Debate sobre B', description: 'Desc B' });

  const response = await request(app).get(`/api/debates?work_id=${work1.id}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.debates.length, 1);
  assert.equal(response.body.debates[0].title, 'Debate sobre A');
});

test('GET /api/debates/:id obtiene detalle de debate existente con sus comentarios', async () => {
  const token = await getAuthToken();
  const work = await createTestWork();

  const createDebateRes = await request(app)
    .post(`/api/works/${work.id}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Final explicado', description: '¿Qué opinan?' });

  const debateId = createDebateRes.body.debate.id;

  await request(app)
    .post(`/api/debates/${debateId}/comments`)
    .set('Authorization', `Bearer ${token}`)
    .send({ content: 'Excelente planteamiento.' });

  const response = await request(app).get(`/api/debates/${debateId}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.debate.title, 'Final explicado');
  assert.ok(Array.isArray(response.body.debate.comments));
  assert.equal(response.body.debate.comments.length, 1);
  assert.equal(response.body.debate.comments[0].content, 'Excelente planteamiento.');
});

test('GET /api/debates/:id devuelve 404 para debate inexistente', async () => {
  const response = await request(app).get('/api/debates/00000000-0000-4000-8000-000000000000');

  assert.equal(response.status, 404);
  assert.match(response.body.message, /no existe|no encontrado/i);
});

test('POST /api/debates/:id/comments publica comentario por usuario autenticado', async () => {
  const token = await getAuthToken();
  const work = await createTestWork();

  const createDebateRes = await request(app)
    .post(`/api/works/${work.id}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Pregunta', description: 'Tema interesante' });

  const debateId = createDebateRes.body.debate.id;

  const response = await request(app)
    .post(`/api/debates/${debateId}/comments`)
    .set('Authorization', `Bearer ${token}`)
    .send({ content: 'Totalmente de acuerdo con el post.' });

  assert.equal(response.status, 201);
  assert.equal(response.body.comment.content, 'Totalmente de acuerdo con el post.');
  assert.equal(response.body.comment.debate_id, debateId);
  assert.ok(response.body.comment.id);
});

test('POST /api/debates/:id/comments rechaza comentario sin autenticación', async () => {
  const token = await getAuthToken();
  const work = await createTestWork();

  const createDebateRes = await request(app)
    .post(`/api/works/${work.id}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Pregunta 2', description: 'Tema' });

  const debateId = createDebateRes.body.debate.id;

  const response = await request(app)
    .post(`/api/debates/${debateId}/comments`)
    .send({ content: 'Comentario sin token' });

  assert.equal(response.status, 401);
  assert.match(response.body.message, /token/i);
});

test('POST /api/debates/:id/comments devuelve 404 en debate inexistente', async () => {
  const token = await getAuthToken();

  const response = await request(app)
    .post('/api/debates/00000000-0000-4000-8000-000000000000/comments')
    .set('Authorization', `Bearer ${token}`)
    .send({ content: 'Comentario a debate fantasma' });

  assert.equal(response.status, 404);
  assert.match(response.body.message, /no existe|no encontrado/i);
});

test('POST /api/debates/:id/comments rechaza comentario con contenido vacío', async () => {
  const token = await getAuthToken();
  const work = await createTestWork();

  const createDebateRes = await request(app)
    .post(`/api/works/${work.id}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Pregunta 3', description: 'Tema 3' });

  const debateId = createDebateRes.body.debate.id;

  const response = await request(app)
    .post(`/api/debates/${debateId}/comments`)
    .set('Authorization', `Bearer ${token}`)
    .send({ content: '   ' });

  assert.equal(response.status, 400);
  assert.match(response.body.message, /contenido|obligatorio/i);
});

test('PUT /api/debates/:id modifica un debate propio con datos válidos', async () => {
  const token = await getAuthToken('author@test.com');
  const work = await createTestWork();

  const debateRes = await request(app)
    .post(`/api/works/${work.id}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Título original', description: 'Descripción original' });

  const debateId = debateRes.body.debate.id;

  const updateRes = await request(app)
    .put(`/api/debates/${debateId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Título modificado', description: 'Descripción actualizada' });

  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.debate.title, 'Título modificado');
  assert.equal(updateRes.body.debate.description, 'Descripción actualizada');
});

test('PUT /api/debates/:id rechaza modificación de debate ajeno', async () => {
  const authorToken = await getAuthToken('author1@test.com');
  const otherToken = await getAuthToken('other@test.com');
  const work = await createTestWork();

  const debateRes = await request(app)
    .post(`/api/works/${work.id}/debates`)
    .set('Authorization', `Bearer ${authorToken}`)
    .send({ title: 'Debate de autor 1', description: 'Desc' });

  const debateId = debateRes.body.debate.id;

  const updateRes = await request(app)
    .put(`/api/debates/${debateId}`)
    .set('Authorization', `Bearer ${otherToken}`)
    .send({ title: 'Hackeado', description: 'Nueva desc' });

  assert.equal(updateRes.status, 403);
  assert.match(updateRes.body.message, /permiso/i);
});

test('PUT /api/debates/:id rechaza modificación con campos vacíos', async () => {
  const token = await getAuthToken('author2@test.com');
  const work = await createTestWork();

  const debateRes = await request(app)
    .post(`/api/works/${work.id}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Debate test', description: 'Desc test' });

  const debateId = debateRes.body.debate.id;

  const updateRes = await request(app)
    .put(`/api/debates/${debateId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: '', description: 'Desc' });

  assert.equal(updateRes.status, 400);
});

test('PUT /api/debates/:id devuelve 404 para debate inexistente', async () => {
  const token = await getAuthToken('author3@test.com');

  const updateRes = await request(app)
    .put('/api/debates/00000000-0000-4000-8000-000000000000')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Título', description: 'Desc' });

  assert.equal(updateRes.status, 404);
});

test('DELETE /api/debates/:id elimina un debate propio', async () => {
  const token = await getAuthToken('author4@test.com');
  const work = await createTestWork();

  const debateRes = await request(app)
    .post(`/api/works/${work.id}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'A borrar', description: 'Desc' });

  const debateId = debateRes.body.debate.id;

  const deleteRes = await request(app)
    .delete(`/api/debates/${debateId}`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(deleteRes.status, 200);

  // Verificar que ya no existe
  const getRes = await request(app).get(`/api/debates/${debateId}`);
  assert.equal(getRes.status, 404);
});

test('DELETE /api/debates/:id rechaza eliminación de debate ajeno', async () => {
  const authorToken = await getAuthToken('author5@test.com');
  const otherToken = await getAuthToken('intruder@test.com');
  const work = await createTestWork();

  const debateRes = await request(app)
    .post(`/api/works/${work.id}/debates`)
    .set('Authorization', `Bearer ${authorToken}`)
    .send({ title: 'Debate protegido', description: 'Desc' });

  const debateId = debateRes.body.debate.id;

  const deleteRes = await request(app)
    .delete(`/api/debates/${debateId}`)
    .set('Authorization', `Bearer ${otherToken}`);

  assert.equal(deleteRes.status, 403);
});

test('DELETE /api/debates/:id devuelve 404 para debate inexistente', async () => {
  const token = await getAuthToken('author6@test.com');

  const deleteRes = await request(app)
    .delete('/api/debates/00000000-0000-4000-8000-000000000000')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(deleteRes.status, 404);
});

test('DELETE /api/debates/:id/comments/:commentId elimina un comentario propio', async () => {
  const authorToken = await getAuthToken('author7@test.com');
  const commenterToken = await getAuthToken('commenter@test.com');
  const work = await createTestWork();

  const debateRes = await request(app)
    .post(`/api/works/${work.id}/debates`)
    .set('Authorization', `Bearer ${authorToken}`)
    .send({ title: 'Debate con comentario', description: 'Desc' });

  const debateId = debateRes.body.debate.id;

  const commentRes = await request(app)
    .post(`/api/debates/${debateId}/comments`)
    .set('Authorization', `Bearer ${commenterToken}`)
    .send({ content: 'Comentario que borraré' });

  const commentId = commentRes.body.comment.id;

  const deleteRes = await request(app)
    .delete(`/api/debates/${debateId}/comments/${commentId}`)
    .set('Authorization', `Bearer ${commenterToken}`);

  assert.equal(deleteRes.status, 200);

  // Verificar que el comentario ya no está en el debate
  const getDebateRes = await request(app).get(`/api/debates/${debateId}`);
  assert.equal(getDebateRes.body.debate.comments.length, 0);
});

test('DELETE /api/debates/:id/comments/:commentId rechaza eliminación de comentario ajeno', async () => {
  const authorToken = await getAuthToken('author8@test.com');
  const commenterToken = await getAuthToken('commenter2@test.com');
  const intruderToken = await getAuthToken('intruder2@test.com');
  const work = await createTestWork();

  const debateRes = await request(app)
    .post(`/api/works/${work.id}/debates`)
    .set('Authorization', `Bearer ${authorToken}`)
    .send({ title: 'Debate', description: 'Desc' });

  const debateId = debateRes.body.debate.id;

  const commentRes = await request(app)
    .post(`/api/debates/${debateId}/comments`)
    .set('Authorization', `Bearer ${commenterToken}`)
    .send({ content: 'Comentario protegido' });

  const commentId = commentRes.body.comment.id;

  const deleteRes = await request(app)
    .delete(`/api/debates/${debateId}/comments/${commentId}`)
    .set('Authorization', `Bearer ${intruderToken}`);

  assert.equal(deleteRes.status, 403);
});

test('Operaciones PUT y DELETE en debates requieren autenticación', async () => {
  const putRes = await request(app).put('/api/debates/00000000-0000-4000-8000-000000000000').send({ title: 'test' });
  assert.equal(putRes.status, 401);

  const delRes = await request(app).delete('/api/debates/00000000-0000-4000-8000-000000000000');
  assert.equal(delRes.status, 401);

  const delComRes = await request(app).delete('/api/debates/00000000-0000-4000-8000-000000000000/comments/00000000-0000-4000-8000-000000000000');
  assert.equal(delComRes.status, 401);
});

test('GET /api/debates pagina el listado de debates con metadatos de navegación', async () => {
  const token = await getAuthToken('debater@test.com');
  const work = await createTestWork('Obra Debates');

  await request(app)
    .post(`/api/works/${work.id}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Debate 1', description: 'Desc 1' });

  await request(app)
    .post(`/api/works/${work.id}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Debate 2', description: 'Desc 2' });

  await request(app)
    .post(`/api/works/${work.id}/debates`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Debate 3', description: 'Desc 3' });

  const page1 = await request(app).get('/api/debates?page=1&limit=2');
  assert.equal(page1.status, 200);
  assert.equal(page1.body.debates.length, 2);
  assert.equal(page1.body.pagination.total, 3);
  assert.equal(page1.body.pagination.page, 1);
  assert.equal(page1.body.pagination.limit, 2);
  assert.equal(page1.body.pagination.totalPages, 2);

  const page2 = await request(app).get('/api/debates?page=2&limit=2');
  assert.equal(page2.status, 200);
  assert.equal(page2.body.debates.length, 1);
  assert.equal(page2.body.pagination.page, 2);
});

