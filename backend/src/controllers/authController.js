const { registerUser, loginUser, getProfile } = require('../services/authService');

function register(req, res) {
  try {
    const user = registerUser(req.body);
    return res.status(201).json({
      message: 'Usuario registrado correctamente.',
      user
    });
  } catch (error) {
    const message = error.message || 'Error al registrar usuario.';
    const status = message.toLowerCase().includes('ya existe') ? 409 : 400;
    return res.status(status).json({ message });
  }
}

function login(req, res) {
  try {
    const payload = loginUser(req.body);
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(401).json({
      message: error.message || 'Credenciales incorrectas.'
    });
  }
}

function me(req, res) {
  try {
    const user = getProfile(req.user.id);
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(404).json({
      message: error.message || 'Usuario no encontrado.'
    });
  }
}

module.exports = {
  register,
  login,
  me
};
