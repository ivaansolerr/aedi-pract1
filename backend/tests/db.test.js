const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const { query, cleanDb } = require('../src/config/db');

test.beforeEach(async () => {
  await cleanDb();
});

test('Conexión y consulta básica a la base de datos', async () => {
  const result = await query('SELECT 1 + 1 AS sum');
  assert.equal(result.rows.length, 1);
  assert.equal(Number(result.rows[0].sum), 2);
});

test('La tabla users persiste registros y restringe email único', async () => {
  const userId = crypto.randomUUID();
  const insertSql = `
    INSERT INTO users (id, username, email, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, email
  `;

  const created = await query(insertSql, [userId, 'Carlos', 'carlos@test.com', 'hash123']);
  assert.equal(created.rows[0].email, 'carlos@test.com');

  // Intentar insertar mismo email debe fallar por constraint UNIQUE
  await assert.rejects(async () => {
    await query(insertSql, [crypto.randomUUID(), 'Carlos 2', 'carlos@test.com', 'hash456']);
  });
});

test('La tabla works persiste registros correctamente', async () => {
  const workId = crypto.randomUUID();
  const insertSql = `
    INSERT INTO works (id, title, type, genre, release_year, duration, synopsis)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, title
  `;

  const created = await query(insertSql, [
    workId,
    'Interstellar',
    'movie',
    'Sci-Fi',
    2014,
    '169 min',
    'Un equipo de exploradores viaja a través de un agujero de gusano.'
  ]);

  assert.equal(created.rows[0].title, 'Interstellar');
  assert.equal(created.rows[0].id, workId);
});
