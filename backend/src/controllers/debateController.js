const {
  createDebate,
  listDebates,
  getDebateById,
  addComment
} = require('../services/debateService');

const createForWork = async (req, res) => {
  try {
    const debate = await createDebate({
      workId: req.params.workId,
      userId: req.user.id,
      title: req.body.title,
      description: req.body.description
    });
    return res.status(201).json({
      message: 'Debate creado correctamente.',
      debate
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({ message: error.message || 'Error al crear el debate.' });
  }
};

const getAll = async (req, res) => {
  try {
    const debates = await listDebates({ workId: req.query.work_id });
    return res.status(200).json({ debates });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error al listar los debates.' });
  }
};

const getOne = async (req, res) => {
  try {
    const debate = await getDebateById(req.params.id);
    return res.status(200).json({ debate });
  } catch (error) {
    const status = error.statusCode || 404;
    return res.status(status).json({ message: error.message || 'El debate no existe.' });
  }
};

const createComment = async (req, res) => {
  try {
    const comment = await addComment({
      debateId: req.params.id,
      userId: req.user.id,
      content: req.body.content
    });
    return res.status(201).json({
      message: 'Comentario publicado correctamente.',
      comment
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({ message: error.message || 'Error al publicar el comentario.' });
  }
};

module.exports = {
  createForWork,
  getAll,
  getOne,
  createComment
};
