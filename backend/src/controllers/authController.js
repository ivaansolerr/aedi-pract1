const { registerUser, loginUser, getProfile } = require('../services/authService');

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

module.exports = {
  register,
  login,
  me
};
