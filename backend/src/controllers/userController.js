const {
  getUsersList,
  getUserProfile,
  updateUserProfileService,
  manageRelationship,
  removeRelationship
} = require('../services/userService');

const getAllUsers = async (req, res) => {
  try {
    const { search, page, limit } = req.query;
    const { users, pagination } = await getUsersList({ query: search, page, limit });
    return res.status(200).json({ users, pagination });
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

const updateProfileHandler = async (req, res) => {
  try {
    const targetUserId = req.params.id === 'me' ? req.user.id : (req.params.id || req.user.id);
    const user = await updateUserProfileService({
      userId: req.user.id,
      targetUserId,
      username: req.body.username,
      name: req.body.name,
      bio: req.body.bio,
      avatar_url: req.body.avatar_url
    });
    return res.status(200).json({
      message: 'Perfil actualizado correctamente.',
      user
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({ message: error.message || 'Error al actualizar el perfil.' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateProfileHandler,
  updateRelationship,
  deleteRelationshipHandler
};
