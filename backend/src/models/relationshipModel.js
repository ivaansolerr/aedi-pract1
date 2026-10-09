const crypto = require('node:crypto');
const { query } = require('../config/db');

const sanitizeRelationship = (rel) => {
  if (!rel) return null;
  return {
    id: rel.id,
    user_id: rel.user_id,
    target_user_id: rel.target_user_id,
    type: rel.type,
    target_username: rel.target_username || null,
    created_at: rel.created_at
  };
};

const findRelationship = async ({ user_id, target_user_id }) => {
  const sql = `
    SELECT id, user_id, target_user_id, type, created_at
    FROM user_relationships
    WHERE user_id = $1 AND target_user_id = $2
    LIMIT 1
  `;
  const result = await query(sql, [user_id, target_user_id]);
  return result.rows[0] || null;
};

const setRelationship = async ({ id, user_id, target_user_id, type }) => {
  const existing = await findRelationship({ user_id, target_user_id });

  if (existing) {
    const updateSql = `
      UPDATE user_relationships
      SET type = $3
      WHERE user_id = $1 AND target_user_id = $2
      RETURNING id, user_id, target_user_id, type, created_at
    `;
    const result = await query(updateSql, [user_id, target_user_id, type]);
    return { relationship: result.rows[0], isNew: false };
  }

  const relId = id || crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const insertSql = `
    INSERT INTO user_relationships (id, user_id, target_user_id, type, created_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, user_id, target_user_id, type, created_at
  `;

  const result = await query(insertSql, [relId, user_id, target_user_id, type, createdAt]);
  return { relationship: result.rows[0], isNew: true };
};

const findRelationshipsByUser = async (userId) => {
  const sql = `
    SELECT r.id, r.user_id, r.target_user_id, r.type, r.created_at,
           u.username as target_username
    FROM user_relationships r
    JOIN users u ON r.target_user_id = u.id
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC
  `;
  const result = await query(sql, [userId]);
  return result.rows;
};

const deleteRelationship = async ({ user_id, target_user_id }) => {
  const sql = `
    DELETE FROM user_relationships
    WHERE user_id = $1 AND target_user_id = $2
    RETURNING id
  `;
  const result = await query(sql, [user_id, target_user_id]);
  return result.rows.length > 0;
};

module.exports = {
  findRelationship,
  setRelationship,
  findRelationshipsByUser,
  deleteRelationship,
  sanitizeRelationship
};
