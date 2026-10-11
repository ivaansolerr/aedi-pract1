const dotenv = require('dotenv');

dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
  DATABASE_URL: process.env.DATABASE_URL || '',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || ''
};

module.exports = env;

