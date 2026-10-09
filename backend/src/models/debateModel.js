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

const findAllDebates = async ({ workId } = {}) => {
  let sql = `
    SELECT d.id, d.work_id, d.user_id, d.title, d.description, d.created_at,
           u.username as author_name, w.title as work_title
    FROM debates d
    JOIN users u ON d.user_id = u.id
    JOIN works w ON d.work_id = w.id
  `;
  const params = [];

  if (workId) {
    sql += ` WHERE d.work_id = $1`;
    params.push(workId);
  }

  sql += ` ORDER BY d.created_at DESC`;

  const result = await query(sql, params);
  return result.rows;
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

module.exports = {
  createDebate,
  findAllDebates,
  findDebateById,
  sanitizeDebate
};
