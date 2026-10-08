const crypto = require('node:crypto');
const {
  createWork: insertWork,
  findAllWorks,
  findWorkById,
  sanitizeWork
} = require('../models/workModel');

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

const listWorks = async () => {
  const works = await findAllWorks();
  return works.map(sanitizeWork);
};

const getWorkById = async (id) => {
  const work = await findWorkById(id);

  if (!work) {
    const error = new Error('La obra no existe.');
    error.statusCode = 404;
    throw error;
  }

  return sanitizeWork(work);
};

module.exports = {
  createWork,
  listWorks,
  getWorkById
};
