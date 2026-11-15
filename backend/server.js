const app = require('./src/app');
const { PORT } = require('./src/config/env');
const { seedData } = require('./src/config/seed');

app.listen(PORT, async () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
  await seedData();
});
