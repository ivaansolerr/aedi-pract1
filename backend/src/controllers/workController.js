const { createWork, listWorks, getWorkById } = require('../services/workService');

const create = (req, res) => {
  try {
    const work = createWork(req.body);
    return res.status(201).json({ message: 'Obra creada correctamente.', work });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Error al crear la obra.' });
  }
};

const getAll = (req, res) => {
  try {
    return res.status(200).json({ works: listWorks() });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error al listar obras.' });
  }
};

const getOne = (req, res) => {
  try {
    const work = getWorkById(req.params.id);
    return res.status(200).json({ work });
  } catch (error) {
    return res.status(404).json({ message: error.message || 'La obra no existe.' });
  }
};

module.exports = {
  create,
  getAll,
  getOne
};
