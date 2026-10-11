const crypto = require('node:crypto');
const { query } = require('../config/db');

const sanitizeNotification = (notif) => {
  if (!notif) return null;
  return {
    id: notif.id,
    user_id: notif.user_id,
    debate_id: notif.debate_id,
    comment_id: notif.comment_id,
    is_read: Boolean(notif.is_read),
    created_at: notif.created_at,
    debate_title: notif.debate_title || null,
    comment_content: notif.comment_content || null
  };
};

const createNotification = async ({ userId, debateId, commentId }) => {
  const notifId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const sql = `
    INSERT INTO notifications (id, user_id, debate_id, comment_id, is_read, created_at)
    VALUES ($1, $2, $3, $4, FALSE, $5)
    RETURNING id, user_id, debate_id, comment_id, is_read, created_at
  `;
  const result = await query(sql, [notifId, userId, debateId, commentId, createdAt]);
  return result.rows[0];
};

const findNotificationById = async (id) => {
  const sql = `
    SELECT id, user_id, debate_id, comment_id, is_read, created_at
    FROM notifications
    WHERE id = $1
    LIMIT 1
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const findNotificationsByUserId = async (userId) => {
  const sql = `
    SELECT n.id, n.user_id, n.debate_id, n.comment_id, n.is_read, n.created_at,
           d.title as debate_title,
           c.content as comment_content
    FROM notifications n
    LEFT JOIN debates d ON n.debate_id = d.id
    LEFT JOIN debate_comments c ON n.comment_id = c.id
    WHERE n.user_id = $1
    ORDER BY n.created_at DESC
  `;
  const result = await query(sql, [userId]);
  return result.rows;
};

const markNotificationAsRead = async (id) => {
  const sql = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = $1
    RETURNING id, user_id, debate_id, comment_id, is_read, created_at
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

module.exports = {
  createNotification,
  findNotificationById,
  findNotificationsByUserId,
  markNotificationAsRead,
  sanitizeNotification
};
