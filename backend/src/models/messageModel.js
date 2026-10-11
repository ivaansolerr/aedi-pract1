const crypto = require('node:crypto');
const { query } = require('../config/db');

const sanitizeMessage = (msg) => {
  if (!msg) return null;
  return {
    id: msg.id,
    sender_id: msg.sender_id,
    receiver_id: msg.receiver_id,
    content: msg.content,
    read: Boolean(msg.read),
    created_at: msg.created_at,
    sender_name: msg.sender_name || null,
    receiver_name: msg.receiver_name || null
  };
};

const createMessage = async ({ sender_id, receiver_id, content }) => {
  const messageId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const sql = `
    INSERT INTO direct_messages (id, sender_id, receiver_id, content, read, created_at)
    VALUES ($1, $2, $3, $4, FALSE, $5)
    RETURNING id, sender_id, receiver_id, content, read, created_at
  `;

  const result = await query(sql, [messageId, sender_id, receiver_id, content, createdAt]);
  return result.rows[0];
};

const findMessageById = async (id) => {
  const sql = `
    SELECT id, sender_id, receiver_id, content, read, created_at
    FROM direct_messages
    WHERE id = $1
    LIMIT 1
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const findConversation = async ({ userId1, userId2 }) => {
  const sql = `
    SELECT m.id, m.sender_id, m.receiver_id, m.content, m.read, m.created_at,
           u1.username as sender_name, u2.username as receiver_name
    FROM direct_messages m
    JOIN users u1 ON m.sender_id = u1.id
    JOIN users u2 ON m.receiver_id = u2.id
    WHERE (m.sender_id = $1 AND m.receiver_id = $2)
       OR (m.sender_id = $2 AND m.receiver_id = $1)
    ORDER BY m.created_at ASC
  `;
  const result = await query(sql, [userId1, userId2]);
  return result.rows;
};

const findConversationsByUser = async (userId) => {
  const sql = `
    SELECT m.id, m.sender_id, m.receiver_id, m.content, m.read, m.created_at,
           u1.username as sender_name, u2.username as receiver_name
    FROM direct_messages m
    JOIN users u1 ON m.sender_id = u1.id
    JOIN users u2 ON m.receiver_id = u2.id
    WHERE m.sender_id = $1 OR m.receiver_id = $1
    ORDER BY m.created_at DESC
  `;
  const result = await query(sql, [userId]);

  const conversationMap = new Map();
  for (const row of result.rows) {
    const otherUserId = row.sender_id === userId ? row.receiver_id : row.sender_id;
    const otherUserName = row.sender_id === userId ? row.receiver_name : row.sender_name;

    if (!conversationMap.has(otherUserId)) {
      conversationMap.set(otherUserId, {
        other_user_id: otherUserId,
        other_username: otherUserName,
        last_message: {
          id: row.id,
          sender_id: row.sender_id,
          receiver_id: row.receiver_id,
          content: row.content,
          read: Boolean(row.read),
          created_at: row.created_at
        }
      });
    }
  }

  return Array.from(conversationMap.values());
};

const markMessageAsRead = async (id) => {
  const sql = `
    UPDATE direct_messages
    SET read = TRUE
    WHERE id = $1
    RETURNING id, sender_id, receiver_id, content, read, created_at
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

module.exports = {
  createMessage,
  findMessageById,
  findConversation,
  findConversationsByUser,
  markMessageAsRead,
  sanitizeMessage
};
