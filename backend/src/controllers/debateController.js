const {
  createDebate,
  listDebates,
  getDebateById,
  addComment,
  editDebate,
  removeDebate,
  removeComment
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
    const { work_id, page, limit } = req.query;
    const { debates, pagination } = await listDebates({ workId: work_id, page, limit });
    return res.status(200).json({ debates, pagination });
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

const update = async (req, res) => {
  try {
    const debate = await editDebate({
      debateId: req.params.id,
      userId: req.user.id,
      title: req.body.title,
      description: req.body.description
    });
    return res.status(200).json({
      message: 'Debate actualizado correctamente.',
      debate
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({ message: error.message || 'Error al actualizar el debate.' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await removeDebate({
      debateId: req.params.id,
      userId: req.user.id
    });
    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({ message: error.message || 'Error al eliminar el debate.' });
  }
};

const deleteCommentHandler = async (req, res) => {
  try {
    const result = await removeComment({
      debateId: req.params.id,
      commentId: req.params.commentId,
      userId: req.user.id
    });
    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({ message: error.message || 'Error al eliminar el comentario.' });
  }
};

const { toggleSubscription } = require('../services/notificationService');

const subscribe = async (req, res) => {
  try {
    const result = await toggleSubscription({
      debateId: req.params.id,
      userId: req.user.id
    });
    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({ message: error.message || 'Error al gestionar la suscripción.' });
  }
};

module.exports = {
  createForWork,
  getAll,
  getOne,
  createComment,
  subscribe,
  update,
  remove,
  deleteCommentHandler
};
