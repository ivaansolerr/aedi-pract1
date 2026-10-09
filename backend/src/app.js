const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const workRoutes = require('./routes/workRoutes');
const debateRoutes = require('./routes/debateRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/works', workRoutes);
app.use('/api/debates', debateRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ message: 'Error interno del servidor.' });
});

module.exports = app;
