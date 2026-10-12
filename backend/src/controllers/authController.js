const { registerUser, loginUser, getProfile, updateProfile } = require('../services/authService');

async function register(req, res) {
  try {
    const user = await registerUser(req.body);
    return res.status(201).json({
      message: 'Usuario registrado correctamente.',
      user
    });
  } catch (error) {
    const message = error.message || 'Error al registrar usuario.';
    const status = error.statusCode || (message.toLowerCase().includes('ya existe') ? 409 : 400);
    return res.status(status).json({ message });
  }
}

async function login(req, res) {
  try {
    const payload = await loginUser(req.body);
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(401).json({
      message: error.message || 'Credenciales incorrectas.'
    });
  }
}

async function me(req, res) {
  try {
    const user = await getProfile(req.user.id);
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(404).json({
      message: error.message || 'Usuario no encontrado.'
    });
  }
}

async function updateMe(req, res) {
  try {
    const user = await updateProfile({
      userId: req.user.id,
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
    return res.status(status).json({
      message: error.message || 'Error al actualizar el perfil.'
    });
  }
}

module.exports = {
  register,
  login,
  me,
  updateMe
};
