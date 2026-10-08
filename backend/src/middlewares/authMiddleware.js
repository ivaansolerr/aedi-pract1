const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config/env');
const { findUserById } = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Token inválido o expirado.' });
    }

    req.user = {
      id: user.id,
      name: user.username,
      username: user.username,
      email: user.email
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = authMiddleware;
