const users = [];

const resetUsers = () => {
  users.length = 0;
};

const addUser = (user) => {
  users.push(user);
};

const findUserByEmail = (email) => {
  return users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());
};

const findUserById = (id) => {
  return users.find((user) => user.id === id);
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  created_at: user.created_at
});

module.exports = {
  users,
  resetUsers,
  addUser,
  findUserByEmail,
  findUserById,
  sanitizeUser
};
