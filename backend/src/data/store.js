const users = [];
const works = [];

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

const resetWorks = () => {
  works.length = 0;
};

const addWork = (work) => {
  works.push(work);
};

const findWorkById = (id) => {
  return works.find((work) => work.id === id);
};

const getAllWorks = () => {
  return [...works];
};

const sanitizeWork = (work) => ({
  id: work.id,
  title: work.title,
  type: work.type,
  genre: work.genre,
  release_year: work.release_year,
  duration: work.duration,
  synopsis: work.synopsis,
  created_at: work.created_at
});

module.exports = {
  users,
  works,
  resetUsers,
  addUser,
  findUserByEmail,
  findUserById,
  sanitizeUser,
  resetWorks,
  addWork,
  findWorkById,
  getAllWorks,
  sanitizeWork
};
