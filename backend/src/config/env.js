const dotenv = require('dotenv');

dotenv.config();

const env = {
  PORT: Number(process.env.PORT) || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me'
};

module.exports = env;
