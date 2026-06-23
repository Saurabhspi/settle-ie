const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const roadmapRoutes = require('./routes/roadmap');
const assistantRoutes = require('./routes/assistant');
const documentRoutes = require('./routes/documents');
const { startReminderJob } = require('./cron/reminders');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/documents', documentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Settle.ie API is running!' });
});

const db = require('./db');
db.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully ✅'))
  .catch((err) => console.error('Database connection failed ❌', err));

startReminderJob();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});