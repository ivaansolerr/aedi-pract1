const {
  getUsersList,
  getUserProfile,
  manageRelationship,
  removeRelationship
} = require('../services/userService');

const getAllUsers = async (req, res) => {
  try {
    const users = await getUsersList({ query: req.query.search });
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error al obtener usuarios.' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await getUserProfile(req.params.id);
    return res.status(200).json({ user });
  } catch (error) {
    const status = error.statusCode || 404;
    return res.status(status).json({ message: error.message || 'Usuario no encontrado.' });
  }
};

const updateRelationship = async (req, res) => {
  try {
    const { relationship, isNew } = await manageRelationship({
      userId: req.user.id,
      targetUserId: req.params.id,
      type: req.body.type
    });

    const status = isNew ? 201 : 200;
    return res.status(status).json({
      message: isNew ? 'Relación creada correctamente.' : 'Relación actualizada correctamente.',
      relationship
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({ message: error.message || 'Error al gestionar la relación.' });
  }
};

const deleteRelationshipHandler = async (req, res) => {
  try {
    const result = await removeRelationship({
      userId: req.user.id,
      targetUserId: req.params.id
    });
    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({ message: error.message || 'Error al eliminar la relación.' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateRelationship,
  deleteRelationshipHandler
};
