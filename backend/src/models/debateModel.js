const crypto = require('node:crypto');
const { query } = require('../config/db');

const sanitizeDebate = (debate) => {
  if (!debate) return null;
  return {
    id: debate.id,
    work_id: debate.work_id,
    user_id: debate.user_id,
    title: debate.title,
    description: debate.description,
    author_name: debate.author_name || null,
    work_title: debate.work_title || null,
    created_at: debate.created_at
  };
};

const createDebate = async ({ id, work_id, user_id, title, description }) => {
  const debateId = id || crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const sql = `
    INSERT INTO debates (id, work_id, user_id, title, description, created_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, work_id, user_id, title, description, created_at
  `;

  const result = await query(sql, [debateId, work_id, user_id, title, description, createdAt]);
  return result.rows[0];
};

const findAllDebates = async ({ workId, page, limit } = {}) => {
  let countSql = `SELECT COUNT(*) AS total FROM debates d`;
  let sql = `
    SELECT d.id, d.work_id, d.user_id, d.title, d.description, d.created_at,
           u.username as author_name, w.title as work_title
    FROM debates d
    JOIN users u ON d.user_id = u.id
    JOIN works w ON d.work_id = w.id
  `;
  const params = [];
  const countParams = [];

  if (workId) {
    countSql += ` WHERE d.work_id = $1`;
    countParams.push(workId);
    sql += ` WHERE d.work_id = $1`;
    params.push(workId);
  }

  const countResult = await query(countSql, countParams);
  const total = parseInt(countResult.rows[0]?.total || 0, 10);

  sql += ` ORDER BY d.created_at DESC`;

  if (page !== undefined || limit !== undefined) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;
    sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limitNum, offset);
  }

  const result = await query(sql, params);
  return {
    debates: result.rows,
    total
  };
};

const findDebateById = async (id) => {
  const sql = `
    SELECT d.id, d.work_id, d.user_id, d.title, d.description, d.created_at,
           u.username as author_name, w.title as work_title
    FROM debates d
    JOIN users u ON d.user_id = u.id
    JOIN works w ON d.work_id = w.id
    WHERE d.id = $1
    LIMIT 1
  `;

  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const updateDebate = async ({ id, title, description }) => {
  const sql = `
    UPDATE debates
    SET title = $2, description = $3
    WHERE id = $1
    RETURNING id, work_id, user_id, title, description, created_at
  `;
  const result = await query(sql, [id, title, description]);
  return result.rows[0] || null;
};

const deleteDebate = async (id) => {
  const sql = `
    DELETE FROM debates
    WHERE id = $1
    RETURNING id
  `;
  const result = await query(sql, [id]);
  return result.rowCount > 0;
};

module.exports = {
  createDebate,
  findAllDebates,
  findDebateById,
  updateDebate,
  deleteDebate,
  sanitizeDebate
};
