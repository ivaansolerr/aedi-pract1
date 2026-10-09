const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Pool } = require('pg');
const { DATABASE_URL } = require('./env');

let pool;
let isInMemory = false;

if (DATABASE_URL && DATABASE_URL.trim().length > 0) {
  pool = new Pool({
    connectionString: DATABASE_URL
  });
} else {
  // Entorno de test o desarrollo sin PostgreSQL externo activo:
  // usamos pg-mem para simular un motor PostgreSQL real en memoria.
  const { newDb } = require('pg-mem');
  const db = newDb();

  db.public.registerFunction({
    name: 'gen_random_uuid',
    implementation: () => crypto.randomUUID()
  });

  db.public.registerFunction({
    name: 'lower',
    implementation: (x) => (x ? String(x).toLowerCase() : null)
  });

  const schemaPath = path.resolve(__dirname, '../../schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.public.none(schemaSql);
  }

  const pgAdapter = db.adapters.createPg();
  pool = new pgAdapter.Pool();
  isInMemory = true;
}

const query = (text, params) => {
  return pool.query(text, params);
};

const cleanDb = async () => {
  await pool.query('DELETE FROM user_relationships');
  await pool.query('DELETE FROM debate_comments');
  await pool.query('DELETE FROM debates');
  await pool.query('DELETE FROM users');
  await pool.query('DELETE FROM works');
};

const closeDb = async () => {
  if (pool && typeof pool.end === 'function') {
    await pool.end();
  }
};

module.exports = {
  pool,
  query,
  cleanDb,
  closeDb,
  isInMemory
};
