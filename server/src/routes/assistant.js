const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { askQuestion } = require('../ai/ragService');

const router = express.Router();

router.use(authMiddleware);

// POST /api/assistant/chat
router.post('/chat', async (req, res) => {
  const userId = req.user.id;
  const { question } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    // Fetch recent chat history for context
    const historyResult = await db.query(
      `SELECT role, content FROM chat_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 6`,
      [userId]
    );

    // Reverse so oldest messages come first
    const chatHistory = historyResult.rows.reverse();

    // Get answer from RAG pipeline
    const { answer, sources } = await askQuestion(question, chatHistory);

    // Save user question to DB
    await db.query(
      `INSERT INTO chat_history (user_id, role, content)
       VALUES ($1, 'user', $2)`,
      [userId, question]
    );

    // Save AI answer to DB
    await db.query(
      `INSERT INTO chat_history (user_id, role, content, sources)
       VALUES ($1, 'assistant', $2, $3)`,
      [userId, answer, JSON.stringify(sources)]
    );

    res.json({ answer, sources });

  } catch (err) {
    // Updated error logging to show full details
    console.error('Chat error full details:');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ 
      error: 'Failed to get answer. Please try again.',
      details: err.message
    });
  }
});

// GET /api/assistant/history
router.get('/history', async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT role, content, sources, created_at
       FROM chat_history
       WHERE user_id = $1
       ORDER BY created_at ASC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;