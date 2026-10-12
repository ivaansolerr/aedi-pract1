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

const findAllWorks = async ({ title, type, genre, release_year, page, limit } = {}) => {
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

  let countSql = `SELECT COUNT(*) AS total FROM works`;
  let sql = `
    SELECT id, title, type, genre, release_year, duration, synopsis, created_at
    FROM works
  `;

  if (conditions.length > 0) {
    const whereClause = ` WHERE ${conditions.join(' AND ')}`;
    countSql += whereClause;
    sql += whereClause;
  }

  const countResult = await query(countSql, [...values]);
  const total = parseInt(countResult.rows[0]?.total || 0, 10);

  sql += ` ORDER BY created_at ASC`;

  if (page !== undefined || limit !== undefined) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;
    sql += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limitNum, offset);
  }

  const result = await query(sql, values);
  return {
    works: result.rows,
    total
  };
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

const updateWork = async ({ id, title, type, genre, release_year, duration, synopsis }) => {
  const sql = `
    UPDATE works
    SET title = $2, type = $3, genre = $4, release_year = $5, duration = $6, synopsis = $7
    WHERE id = $1
    RETURNING id, title, type, genre, release_year, duration, synopsis, created_at
  `;
  const result = await query(sql, [
    id,
    title,
    type,
    genre,
    Number(release_year),
    duration,
    synopsis
  ]);
  return result.rows[0] || null;
};

const deleteWork = async (id) => {
  const sql = `
    DELETE FROM works
    WHERE id = $1
    RETURNING id
  `;
  const result = await query(sql, [id]);
  return result.rowCount > 0;
};

module.exports = {
  createWork,
  findAllWorks,
  findWorkById,
  updateWork,
  deleteWork,
  sanitizeWork
};
