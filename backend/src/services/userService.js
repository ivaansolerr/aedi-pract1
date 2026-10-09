const {
  findUserById,
  searchUsers,
  sanitizePublicProfile
} = require('../models/userModel');
const {
  setRelationship,
  deleteRelationship,
  sanitizeRelationship
} = require('../models/relationshipModel');

const getUsersList = async ({ query } = {}) => {
  const users = await searchUsers({ query });
  return users.map(sanitizePublicProfile);
};

const getUserProfile = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    const error = new Error('Usuario no encontrado.');
    error.statusCode = 404;
    throw error;
  }
  return sanitizePublicProfile(user);
};

const manageRelationship = async ({ userId, targetUserId, type }) => {
  if (userId === targetUserId) {
    const error = new Error('No puedes establecer una relación contigo mismo.');
    error.statusCode = 400;
    throw error;
  }

  if (!type || !['friend', 'blocked'].includes(type)) {
    const error = new Error('El tipo de relación debe ser "friend" o "blocked".');
    error.statusCode = 400;
    throw error;
  }

  const targetUser = await findUserById(targetUserId);
  if (!targetUser) {
    const error = new Error('El usuario objetivo no existe.');
    error.statusCode = 404;
    throw error;
  }

  const { relationship, isNew } = await setRelationship({
    user_id: userId,
    target_user_id: targetUserId,
    type
  });

  return {
    relationship: sanitizeRelationship(relationship),
    isNew
  };
};

const removeRelationship = async ({ userId, targetUserId }) => {
  const targetUser = await findUserById(targetUserId);
  if (!targetUser) {
    const error = new Error('El usuario objetivo no existe.');
    error.statusCode = 404;
    throw error;
  }

  const deleted = await deleteRelationship({
    user_id: userId,
    target_user_id: targetUserId
  });

  if (!deleted) {
    const error = new Error('No existe una relación previa con este usuario.');
    error.statusCode = 404;
    throw error;
  }

  return { message: 'Relación eliminada correctamente.' };
};

module.exports = {
  getUsersList,
  getUserProfile,
  manageRelationship,
  removeRelationship
};
