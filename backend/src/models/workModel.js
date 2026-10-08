const crypto = require('node:crypto');
const { query } = require('../config/db');

const sanitizeWork = (work) => {
  if (!work) return null;
  return {
    id: work.id,
    title: work.title,
    type: work.type,
    genre: work.genre,
    release_year: Number(work.release_year),
    duration: work.duration,
    synopsis: work.synopsis,
    created_at: work.created_at
  };
};

const createWork = async ({ id, title, type, genre, release_year, duration, synopsis }) => {
  const workId = id || crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const sql = `
    INSERT INTO works (id, title, type, genre, release_year, duration, synopsis, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, title, type, genre, release_year, duration, synopsis, created_at
  `;

  const result = await query(sql, [
    workId,
    title,
    type,
    genre,
    Number(release_year),
    duration,
    synopsis,
    createdAt
  ]);

  return result.rows[0];
};

const findAllWorks = async () => {
  const sql = `
    SELECT id, title, type, genre, release_year, duration, synopsis, created_at
    FROM works
    ORDER BY created_at ASC
  `;

  const result = await query(sql);
  return result.rows;
};

const findWorkById = async (id) => {
  const sql = `
    SELECT id, title, type, genre, release_year, duration, synopsis, created_at
    FROM works
    WHERE id = $1
    LIMIT 1
  `;

  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

module.exports = {
  createWork,
  findAllWorks,
  findWorkById,
  sanitizeWork
};
