const {
  createWork,
  listWorks,
  getWorkById,
  updateWorkById,
  deleteWorkById
} = require('../services/workService');

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
    const { title, type, genre, release_year } = req.query;
    const works = await listWorks({ title, type, genre, release_year });
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

const update = async (req, res) => {
  try {
    const work = await updateWorkById(req.params.id, req.body);
    return res.status(200).json({
      message: 'Obra actualizada correctamente.',
      work
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({ message: error.message || 'Error al actualizar la obra.' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await deleteWorkById(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({ message: error.message || 'Error al eliminar la obra.' });
  }
};

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove
};
