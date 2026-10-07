const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config/env');
const { addUser, findUserByEmail, findUserById, sanitizeUser } = require('../data/store');

function registerUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error('Todos los campos son obligatorios.');
  }

  const normalizedName = String(name).trim();
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

  if (findUserByEmail(normalizedEmail)) {
    throw new Error('Ya existe un usuario con ese email.');
  }

  const user = {
    id: crypto.randomUUID(),
    name: normalizedName,
    email: normalizedEmail,
    password_hash: bcrypt.hashSync(password, 10),
    created_at: new Date().toISOString()
  };

  addUser(user);

  return sanitizeUser(user);
}

function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error('Email y contraseña son obligatorios.');
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = findUserByEmail(normalizedEmail);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    throw new Error('Credenciales incorrectas.');
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '1h'
  });

  return {
    token,
    user: sanitizeUser(user)
  };
}

function getProfile(userId) {
  const user = findUserById(userId);

  if (!user) {
    throw new Error('Usuario no encontrado.');
  }

  return sanitizeUser(user);
}

module.exports = {
  registerUser,
  loginUser,
  getProfile
};
