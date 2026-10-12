const {
  findUserById,
  findUserByUsername,
  updateUserProfile,
  searchUsers,
  sanitizeUser,
  sanitizePublicProfile
} = require('../models/userModel');
const {
  setRelationship,
  deleteRelationship,
  sanitizeRelationship
} = require('../models/relationshipModel');

const getUsersList = async ({ query, page, limit } = {}) => {
  const { users, total } = await searchUsers({ query, page, limit });
  const pageNum = page !== undefined ? Math.max(1, parseInt(page, 10) || 1) : 1;
  const limitNum = limit !== undefined ? Math.max(1, Math.min(100, parseInt(limit, 10) || 20)) : total;
  const totalPages = limitNum > 0 ? Math.ceil(total / limitNum) : 1;

  return {
    users: users.map(sanitizePublicProfile),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages
    }
  };
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

const updateUserProfileService = async ({ userId, targetUserId, username, name, bio, avatar_url }) => {
  if (targetUserId && targetUserId !== userId) {
    const error = new Error('No tienes permiso para modificar el perfil de otro usuario.');
    error.statusCode = 403;
    throw error;
  }

  const existingUser = await findUserById(userId);
  if (!existingUser) {
    const error = new Error('Usuario no encontrado.');
    error.statusCode = 404;
    throw error;
  }

  const newUsername = username !== undefined ? username : name;
  let normalizedUsername;

  if (newUsername !== undefined) {
    normalizedUsername = String(newUsername).trim();
    if (normalizedUsername.length === 0) {
      const error = new Error('El nombre de usuario no puede estar vacío.');
      error.statusCode = 400;
      throw error;
    }
    if (normalizedUsername.length < 2) {
      const error = new Error('El nombre debe tener al menos 2 caracteres.');
      error.statusCode = 400;
      throw error;
    }

    if (normalizedUsername.toLowerCase() !== existingUser.username.toLowerCase()) {
      const collision = await findUserByUsername(normalizedUsername);
      if (collision && collision.id !== userId) {
        const error = new Error('Ya existe un usuario con ese nombre.');
        error.statusCode = 409;
        throw error;
      }
    }
  }

  const updated = await updateUserProfile({
    id: userId,
    username: normalizedUsername,
    bio: bio !== undefined ? (bio === null ? null : String(bio).trim()) : undefined,
    avatar_url: avatar_url !== undefined ? (avatar_url === null ? null : String(avatar_url).trim()) : undefined
  });

  return sanitizeUser(updated);
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
  updateUserProfileService,
  manageRelationship,
  removeRelationship
};
