const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config/env');
const {
  createUser,
  findUserByEmail,
  findUserById,
  sanitizeUser
} = require('../models/userModel');

async function registerUser(payload) {
  const { name, username, email, password } = payload || {};
  const displayName = name || username;

  if (!displayName || !email || !password) {
    throw new Error('Todos los campos son obligatorios.');
  }

  const normalizedName = String(displayName).trim();
  const normalizedEmail = String(email).trim().toLowerCase();

  if (normalizedName.length < 2) {
    throw new Error('El nombre debe tener al menos 2 caracteres.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('El email no tiene un formato válido.');
  }

  if (String(password).length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres.');
  }

  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    const error = new Error('Ya existe un usuario con ese email.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const newUser = await createUser({
    id: crypto.randomUUID(),
    username: normalizedName,
    email: normalizedEmail,
    password_hash: passwordHash
  });

  return sanitizeUser(newUser);
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error('Email y contraseña son obligatorios.');
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    const error = new Error('Credenciales incorrectas.');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '1h'
  });

  return {
    token,
    user: sanitizeUser(user)
  };
}

async function getProfile(userId) {
  const user = await findUserById(userId);

  if (!user) {
    const error = new Error('Usuario no encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
}

module.exports = {
  registerUser,
  loginUser,
  getProfile
};
