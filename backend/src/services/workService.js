const crypto = require('node:crypto');

const { addWork, findWorkById, getAllWorks, sanitizeWork } = require('../data/store');

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

const createWork = (payload) => {
  const parsed = validateWorkInput(payload);

  const work = {
    id: crypto.randomUUID(),
    ...parsed,
    created_at: new Date().toISOString()
  };

  addWork(work);

  return sanitizeWork(work);
};

const listWorks = () => {
  return getAllWorks().map(sanitizeWork);
};

const getWorkById = (id) => {
  const work = findWorkById(id);

  if (!work) {
    throw new Error('La obra no existe.');
  }

  return sanitizeWork(work);
};

module.exports = {
  createWork,
  listWorks,
  getWorkById
};
