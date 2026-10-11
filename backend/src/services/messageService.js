const { findUserById } = require('../models/userModel');
const { findRelationship } = require('../models/relationshipModel');
const {
  createMessage,
  findMessageById,
  findConversation,
  findConversationsByUser,
  markMessageAsRead: updateMessageAsRead,
  sanitizeMessage
} = require('../models/messageModel');
const { broadcastMessage } = require('../config/supabase');

const sendMessage = async ({ senderId, receiverId, content }) => {
  if (!content || String(content).trim().length === 0) {
    const error = new Error('El contenido del mensaje es obligatorio.');
    error.statusCode = 400;
    throw error;
  }

  if (senderId === receiverId) {
    const error = new Error('No puedes enviarte mensajes a ti mismo.');
    error.statusCode = 400;
    throw error;
  }

  const receiver = await findUserById(receiverId);
  if (!receiver) {
    const error = new Error('El usuario destinatario no existe.');
    error.statusCode = 404;
    throw error;
  }

  // Comprobar si el emisor ha bloqueado al receptor
  const outgoingRel = await findRelationship({ user_id: senderId, target_user_id: receiverId });
  if (outgoingRel && outgoingRel.type === 'blocked') {
    const error = new Error('No puedes enviar mensajes a este usuario porque lo has bloqueado.');
    error.statusCode = 403;
    throw error;
  }

  // Comprobar si el receptor ha bloqueado al emisor
  const incomingRel = await findRelationship({ user_id: receiverId, target_user_id: senderId });
  if (incomingRel && incomingRel.type === 'blocked') {
    const error = new Error('No puedes enviar mensajes a este usuario porque te ha bloqueado.');
    error.statusCode = 403;
    throw error;
  }

  const message = await createMessage({
    sender_id: senderId,
    receiver_id: receiverId,
    content: String(content).trim()
  });

  const sanitized = sanitizeMessage(message);

  // Emitir evento a Supabase Realtime si está configurado
  const channelName = `chat-${[senderId, receiverId].sort().join('-')}`;
  await broadcastMessage(channelName, 'new_message', sanitized);

  return sanitized;
};

const getConversation = async ({ userId, targetUserId }) => {
  const target = await findUserById(targetUserId);
  if (!target) {
    const error = new Error('El usuario no existe.');
    error.statusCode = 404;
    throw error;
  }

  const messages = await findConversation({ userId1: userId, userId2: targetUserId });
  return messages.map(sanitizeMessage);
};

const getConversations = async (userId) => {
  return findConversationsByUser(userId);
};

const markAsRead = async ({ messageId, userId }) => {
  const message = await findMessageById(messageId);
  if (!message) {
    const error = new Error('El mensaje no existe.');
    error.statusCode = 404;
    throw error;
  }

  if (message.receiver_id !== userId) {
    const error = new Error('No tienes permiso para marcar este mensaje como leído.');
    error.statusCode = 403;
    throw error;
  }

  const updated = await updateMessageAsRead(messageId);
  return sanitizeMessage(updated);
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead
};
