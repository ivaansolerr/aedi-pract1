const { findWorkById } = require('../models/workModel');
const {
  createDebate: insertDebate,
  findAllDebates,
  findDebateById,
  sanitizeDebate
} = require('../models/debateModel');
const {
  createComment: insertComment,
  findCommentsByDebateId,
  sanitizeComment
} = require('../models/commentModel');

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

const listDebates = async ({ workId } = {}) => {
  const debates = await findAllDebates({ workId });
  return debates.map(sanitizeDebate);
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

  return sanitizeComment(comment);
};

module.exports = {
  createDebate,
  listDebates,
  getDebateById,
  addComment
};
