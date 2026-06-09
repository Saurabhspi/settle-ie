const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const roadmapRoutes = require('./routes/roadmap');
const assistantRoutes = require('./routes/assistant'); // ADD THIS

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/assistant', assistantRoutes); // ADD THIS

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Settle.ie API is running!' });
});

const db = require('./db');
db.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully ✅'))
  .catch((err) => console.error('Database connection failed ❌', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});