const crypto = require('node:crypto');
const { query } = require('../config/db');

const sanitizeComment = (comment) => {
  if (!comment) return null;
  return {
    id: comment.id,
    debate_id: comment.debate_id,
    user_id: comment.user_id,
    content: comment.content,
    author_name: comment.author_name || null,
    created_at: comment.created_at
  };
};

const createComment = async ({ id, debate_id, user_id, content }) => {
  const commentId = id || crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const sql = `
    INSERT INTO debate_comments (id, debate_id, user_id, content, created_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, debate_id, user_id, content, created_at
  `;

  const result = await query(sql, [commentId, debate_id, user_id, content, createdAt]);
  return result.rows[0];
};

const findCommentsByDebateId = async (debateId) => {
  const sql = `
    SELECT c.id, c.debate_id, c.user_id, c.content, c.created_at,
           u.username as author_name
    FROM debate_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.debate_id = $1
    ORDER BY c.created_at ASC
  `;

  const result = await query(sql, [debateId]);
  return result.rows;
};

module.exports = {
  createComment,
  findCommentsByDebateId,
  sanitizeComment
};
