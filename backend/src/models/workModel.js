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

const findAllWorks = async ({ title, type, genre, release_year } = {}) => {
  const conditions = [];
  const values = [];

  if (title && String(title).trim().length > 0) {
    values.push(`%${String(title).trim()}%`);
    conditions.push(`LOWER(title) LIKE LOWER($${values.length})`);
  }

  if (type && String(type).trim().length > 0) {
    values.push(String(type).trim().toLowerCase());
    conditions.push(`LOWER(type) = $${values.length}`);
  }

  if (genre && String(genre).trim().length > 0) {
    values.push(`%${String(genre).trim().toLowerCase()}%`);
    conditions.push(`LOWER(genre) LIKE $${values.length}`);
  }

  if (release_year !== undefined && release_year !== null && String(release_year).trim().length > 0) {
    const yearNum = Number(release_year);
    if (!Number.isNaN(yearNum)) {
      values.push(yearNum);
      conditions.push(`release_year = $${values.length}`);
    }
  }

  let sql = `
    SELECT id, title, type, genre, release_year, duration, synopsis, created_at
    FROM works
  `;

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  sql += ` ORDER BY created_at ASC`;

  const result = await query(sql, values);
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
