const crypto = require('node:crypto');
const { query } = require('../config/db');

const sanitizeUser = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    name: user.username,
    username: user.username,
    email: user.email,
    avatar_url: user.avatar_url || null,
    bio: user.bio || null,
    created_at: user.created_at
  };
};

const sanitizePublicProfile = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    name: user.username,
    avatar_url: user.avatar_url || null,
    bio: user.bio || null,
    created_at: user.created_at
  };
};

const createUser = async ({ id, username, email, password_hash }) => {
  const userId = id || crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const sql = `
    INSERT INTO users (id, username, email, password_hash, created_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, username, email, password_hash, avatar_url, bio, created_at
  `;

  const result = await query(sql, [userId, username, email, password_hash, createdAt]);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const sql = `
    SELECT id, username, email, password_hash, avatar_url, bio, created_at
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
  `;

  const result = await query(sql, [email]);
  return result.rows[0] || null;
};

const findUserById = async (id) => {
  const sql = `
    SELECT id, username, email, password_hash, avatar_url, bio, created_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;

  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const findUserByUsername = async (username) => {
  const sql = `
    SELECT id, username, email, password_hash, avatar_url, bio, created_at
    FROM users
    WHERE LOWER(username) = LOWER($1)
    LIMIT 1
  `;

  const result = await query(sql, [username]);
  return result.rows[0] || null;
};

const updateUserProfile = async ({ id, username, bio, avatar_url }) => {
  const fields = [];
  const params = [id];
  let idx = 2;

  if (username !== undefined) {
    fields.push(`username = $${idx++}`);
    params.push(username);
  }
  if (bio !== undefined) {
    fields.push(`bio = $${idx++}`);
    params.push(bio);
  }
  if (avatar_url !== undefined) {
    fields.push(`avatar_url = $${idx++}`);
    params.push(avatar_url);
  }

  if (fields.length === 0) {
    return findUserById(id);
  }

  const sql = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $1
    RETURNING id, username, email, password_hash, avatar_url, bio, created_at
  `;

  const result = await query(sql, params);
  return result.rows[0] || null;
};

const searchUsers = async ({ query: searchQuery, page, limit } = {}) => {
  let countSql = `SELECT COUNT(*) AS total FROM users`;
  let sql = `
    SELECT id, username, avatar_url, bio, created_at
    FROM users
  `;
  const params = [];
  const countParams = [];

  if (searchQuery && String(searchQuery).trim().length > 0) {
    const filter = ` WHERE LOWER(username) LIKE LOWER($1)`;
    countSql += filter;
    countParams.push(`%${String(searchQuery).trim()}%`);
    sql += filter;
    params.push(`%${String(searchQuery).trim()}%`);
  }

  const countResult = await query(countSql, countParams);
  const total = parseInt(countResult.rows[0]?.total || 0, 10);

  sql += ` ORDER BY username ASC`;

  if (page !== undefined || limit !== undefined) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;
    sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limitNum, offset);
  }

  const result = await query(sql, params);
  return {
    users: result.rows,
    total
  };
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  updateUserProfile,
  searchUsers,
  sanitizeUser,
  sanitizePublicProfile
};
