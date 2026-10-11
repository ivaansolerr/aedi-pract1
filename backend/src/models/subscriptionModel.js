const crypto = require('node:crypto');
const { query } = require('../config/db');

const sanitizeSubscription = (sub) => {
  if (!sub) return null;
  return {
    id: sub.id,
    debate_id: sub.debate_id,
    user_id: sub.user_id,
    created_at: sub.created_at
  };
};

const findSubscription = async ({ debateId, userId }) => {
  const sql = `
    SELECT id, debate_id, user_id, created_at
    FROM debate_subscriptions
    WHERE debate_id = $1 AND user_id = $2
    LIMIT 1
  `;
  const result = await query(sql, [debateId, userId]);
  return result.rows[0] || null;
};

const createSubscription = async ({ debateId, userId }) => {
  const subId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const sql = `
    INSERT INTO debate_subscriptions (id, debate_id, user_id, created_at)
    VALUES ($1, $2, $3, $4)
    RETURNING id, debate_id, user_id, created_at
  `;
  const result = await query(sql, [subId, debateId, userId, createdAt]);
  return result.rows[0];
};

const deleteSubscription = async ({ debateId, userId }) => {
  const sql = `
    DELETE FROM debate_subscriptions
    WHERE debate_id = $1 AND user_id = $2
    RETURNING id
  `;
  const result = await query(sql, [debateId, userId]);
  return result.rowCount > 0;
};

const findSubscribersByDebateId = async (debateId) => {
  const sql = `
    SELECT user_id
    FROM debate_subscriptions
    WHERE debate_id = $1
  `;
  const result = await query(sql, [debateId]);
  return result.rows.map((r) => r.user_id);
};

module.exports = {
  findSubscription,
  createSubscription,
  deleteSubscription,
  findSubscribersByDebateId,
  sanitizeSubscription
};
