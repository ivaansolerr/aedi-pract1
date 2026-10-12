const crypto = require('node:crypto');
const {
  createWork: insertWork,
  findAllWorks,
  findWorkById,
  updateWork,
  deleteWork,
  sanitizeWork
} = require('../models/workModel');
const { findAllDebates, sanitizeDebate } = require('../models/debateModel');

const validateWorkInput = (data) => {
  const { title, type, genre, release_year, duration, synopsis } = data || {};

  if (!title || String(title).trim().length === 0) {
    throw new Error('El título es obligatorio.');
  }

  if (!type || String(type).trim().length === 0) {
    throw new Error('El tipo de obra es obligatorio.');
  }

  if (!genre || String(genre).trim().length === 0) {
    throw new Error('El género es obligatorio.');
  }

  if (release_year === undefined || release_year === null || Number.isNaN(Number(release_year))) {
    throw new Error('El año de publicación es obligatorio.');
  }

  if (!duration || String(duration).trim().length === 0) {
    throw new Error('La duración es obligatoria.');
  }

  if (!synopsis || String(synopsis).trim().length === 0) {
    throw new Error('La sinopsis es obligatoria.');
  }

  return {
    title: String(title).trim(),
    type: String(type).trim(),
    genre: String(genre).trim(),
    release_year: Number(release_year),
    duration: String(duration).trim(),
    synopsis: String(synopsis).trim()
  };
};

const createWork = async (payload) => {
  const parsed = validateWorkInput(payload);

  const work = await insertWork({
    id: crypto.randomUUID(),
    ...parsed
  });

  return sanitizeWork(work);
};

const listWorks = async (filters = {}) => {
  const { works, total } = await findAllWorks(filters);
  const pageNum = filters.page !== undefined ? Math.max(1, parseInt(filters.page, 10) || 1) : 1;
  const limitNum = filters.limit !== undefined ? Math.max(1, Math.min(100, parseInt(filters.limit, 10) || 20)) : total;
  const totalPages = limitNum > 0 ? Math.ceil(total / limitNum) : 1;

  return {
    works: works.map(sanitizeWork),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages
    }
  };
};

const getWorkById = async (id) => {
  const work = await findWorkById(id);

  if (!work) {
    const error = new Error('La obra no existe.');
    error.statusCode = 404;
    throw error;
  }

  const debatesResult = await findAllDebates({ workId: id });
  const debatesList = Array.isArray(debatesResult) ? debatesResult : (debatesResult.debates || []);

  return {
    ...sanitizeWork(work),
    debates: debatesList.map(sanitizeDebate)
  };
};

const updateWorkById = async (id, data) => {
  const existing = await findWorkById(id);
  if (!existing) {
    const error = new Error('La obra no existe.');
    error.statusCode = 404;
    throw error;
  }

  const parsed = validateWorkInput(data);
  const updated = await updateWork({ id, ...parsed });
  return sanitizeWork(updated);
};

const deleteWorkById = async (id) => {
  const existing = await findWorkById(id);
  if (!existing) {
    const error = new Error('La obra no existe.');
    error.statusCode = 404;
    throw error;
  }

  await deleteWork(id);
  return { message: 'Obra eliminada correctamente.' };
};

module.exports = {
  createWork,
  listWorks,
  getWorkById,
  updateWorkById,
  deleteWorkById
};
