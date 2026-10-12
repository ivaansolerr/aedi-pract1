const { findWorkById } = require('../models/workModel');
const {
  createDebate: insertDebate,
  findAllDebates,
  findDebateById,
  updateDebate,
  deleteDebate,
  sanitizeDebate
} = require('../models/debateModel');
const {
  createComment: insertComment,
  findCommentsByDebateId,
  findCommentById,
  deleteComment,
  sanitizeComment
} = require('../models/commentModel');
const { notifyDebateSubscribers } = require('./notificationService');

const createDebate = async ({ workId, userId, title, description }) => {
  if (!title || String(title).trim().length === 0) {
    const error = new Error('El título es obligatorio.');
    error.statusCode = 400;
    throw error;
  }

  if (!description || String(description).trim().length === 0) {
    const error = new Error('La descripción es obligatoria.');
    error.statusCode = 400;
    throw error;
  }

  const work = await findWorkById(workId);
  if (!work) {
    const error = new Error('La obra asociada no existe.');
    error.statusCode = 404;
    throw error;
  }

  const debate = await insertDebate({
    work_id: workId,
    user_id: userId,
    title: String(title).trim(),
    description: String(description).trim()
  });

  return sanitizeDebate(debate);
};

const listDebates = async ({ workId, page, limit } = {}) => {
  const { debates, total } = await findAllDebates({ workId, page, limit });
  const pageNum = page !== undefined ? Math.max(1, parseInt(page, 10) || 1) : 1;
  const limitNum = limit !== undefined ? Math.max(1, Math.min(100, parseInt(limit, 10) || 20)) : total;
  const totalPages = limitNum > 0 ? Math.ceil(total / limitNum) : 1;

  return {
    debates: debates.map(sanitizeDebate),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages
    }
  };
};

const getDebateById = async (id) => {
  const debate = await findDebateById(id);
  if (!debate) {
    const error = new Error('El debate no existe.');
    error.statusCode = 404;
    throw error;
  }

  const comments = await findCommentsByDebateId(id);

  return {
    ...sanitizeDebate(debate),
    comments: comments.map(sanitizeComment)
  };
};

const addComment = async ({ debateId, userId, content }) => {
  if (!content || String(content).trim().length === 0) {
    const error = new Error('El contenido del comentario es obligatorio.');
    error.statusCode = 400;
    throw error;
  }

  const debate = await findDebateById(debateId);
  if (!debate) {
    const error = new Error('El debate no existe.');
    error.statusCode = 404;
    throw error;
  }

  const comment = await insertComment({
    debate_id: debateId,
    user_id: userId,
    content: String(content).trim()
  });

  await notifyDebateSubscribers({
    debateId,
    commentId: comment.id,
    authorId: userId
  });

  return sanitizeComment(comment);
};

const editDebate = async ({ debateId, userId, title, description }) => {
  const debate = await findDebateById(debateId);
  if (!debate) {
    const error = new Error('El debate no existe.');
    error.statusCode = 404;
    throw error;
  }

  if (debate.user_id !== userId) {
    const error = new Error('No tienes permiso para modificar este debate.');
    error.statusCode = 403;
    throw error;
  }

  if (!title || String(title).trim().length === 0) {
    const error = new Error('El título es obligatorio.');
    error.statusCode = 400;
    throw error;
  }

  if (!description || String(description).trim().length === 0) {
    const error = new Error('La descripción es obligatoria.');
    error.statusCode = 400;
    throw error;
  }

  const updated = await updateDebate({
    id: debateId,
    title: String(title).trim(),
    description: String(description).trim()
  });

  return sanitizeDebate(updated);
};

const removeDebate = async ({ debateId, userId }) => {
  const debate = await findDebateById(debateId);
  if (!debate) {
    const error = new Error('El debate no existe.');
    error.statusCode = 404;
    throw error;
  }

  if (debate.user_id !== userId) {
    const error = new Error('No tienes permiso para eliminar este debate.');
    error.statusCode = 403;
    throw error;
  }

  await deleteDebate(debateId);
  return { message: 'Debate eliminado correctamente.' };
};

const removeComment = async ({ debateId, commentId, userId }) => {
  const debate = await findDebateById(debateId);
  if (!debate) {
    const error = new Error('El debate no existe.');
    error.statusCode = 404;
    throw error;
  }

  const comment = await findCommentById(commentId);
  if (!comment) {
    const error = new Error('El comentario no existe.');
    error.statusCode = 404;
    throw error;
  }

  if (comment.debate_id !== debateId) {
    const error = new Error('El comentario no pertenece a este debate.');
    error.statusCode = 400;
    throw error;
  }

  if (comment.user_id !== userId) {
    const error = new Error('No tienes permiso para eliminar este comentario.');
    error.statusCode = 403;
    throw error;
  }

  await deleteComment(commentId);
  return { message: 'Comentario eliminado correctamente.' };
};

module.exports = {
  createDebate,
  listDebates,
  getDebateById,
  addComment,
  editDebate,
  removeDebate,
  removeComment
};
