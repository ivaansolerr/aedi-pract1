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

const searchUsers = async ({ query: searchQuery } = {}) => {
  let sql = `
    SELECT id, username, avatar_url, bio, created_at
    FROM users
  `;
  const params = [];

  if (searchQuery && String(searchQuery).trim().length > 0) {
    sql += ` WHERE LOWER(username) LIKE LOWER($1)`;
    params.push(`%${String(searchQuery).trim()}%`);
  }

  sql += ` ORDER BY username ASC`;

  const result = await query(sql, params);
  return result.rows;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  searchUsers,
  sanitizeUser,
  sanitizePublicProfile
};
