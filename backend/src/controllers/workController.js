const { createWork, listWorks, getWorkById } = require('../services/workService');

const create = async (req, res) => {
  try {
    const work = await createWork(req.body);
    return res.status(201).json({ message: 'Obra creada correctamente.', work });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({ message: error.message || 'Error al crear la obra.' });
  }
};

const getAll = async (req, res) => {
  try {
    const works = await listWorks();
    return res.status(200).json({ works });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error al listar obras.' });
  }
};

const getOne = async (req, res) => {
  try {
    const work = await getWorkById(req.params.id);
    return res.status(200).json({ work });
  } catch (error) {
    const status = error.statusCode || 404;
    return res.status(status).json({ message: error.message || 'La obra no existe.' });
  }
};

module.exports = {
  create,
  getAll,
  getOne
};
