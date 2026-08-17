const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const CATEGORIES = [
  'pps_number',
  'bank_account',
  'irp_card',
  'housing',
  'tax',
  'health',
  'transport',
  'general',
];

// GET /api/community
// Fetch all tips ordered by likes then date
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { category } = req.query;

  try {
    let query = `
      SELECT 
        ct.id,
        ct.title,
        ct.content,
        ct.category,
        ct.likes,
        ct.created_at,
        u.full_name,
        EXISTS (
          SELECT 1 FROM tip_likes tl 
          WHERE tl.tip_id = ct.id 
          AND tl.user_id = $1
        ) as has_liked
      FROM community_tips ct
      JOIN users u ON u.id = ct.user_id
    `;

    const params = [userId];

    if (category && category !== 'all') {
      query += ` WHERE ct.category = $2`;
      params.push(category);
    }

    query += ` ORDER BY ct.likes DESC, ct.created_at DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch tips error:', err);
    res.status(500).json({ error: 'Failed to fetch tips' });
  }
});

// POST /api/community
// Create a new tip
router.post('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { title, content, category } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ error: 'Title, content and category are required' });
  }

  if (title.length > 255) {
    return res.status(400).json({ error: 'Title must be under 255 characters' });
  }

  if (content.length > 2000) {
    return res.status(400).json({ error: 'Content must be under 2000 characters' });
  }

  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    const result = await db.query(
      `INSERT INTO community_tips (user_id, title, content, category)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, title, content, category]
    );

    const userResult = await db.query(
      'SELECT full_name FROM users WHERE id = $1',
      [userId]
    );

    res.status(201).json({
      ...result.rows[0],
      full_name: userResult.rows[0].full_name,
      has_liked: false,
    });
  } catch (err) {
    console.error('Create tip error:', err);
    res.status(500).json({ error: 'Failed to create tip' });
  }
});

// POST /api/community/:tipId/like
// Toggle like on a tip
router.post('/:tipId/like', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { tipId } = req.params;

  try {
    // Check if already liked
    const existing = await db.query(
      'SELECT id FROM tip_likes WHERE tip_id = $1 AND user_id = $2',
      [tipId, userId]
    );

    if (existing.rows.length > 0) {
      // Unlike — remove the like
      await db.query(
        'DELETE FROM tip_likes WHERE tip_id = $1 AND user_id = $2',
        [tipId, userId]
      );
      await db.query(
        'UPDATE community_tips SET likes = likes - 1 WHERE id = $1',
        [tipId]
      );
      res.json({ liked: false });
    } else {
      // Like — add the like
      await db.query(
        'INSERT INTO tip_likes (tip_id, user_id) VALUES ($1, $2)',
        [tipId, userId]
      );
      await db.query(
        'UPDATE community_tips SET likes = likes + 1 WHERE id = $1',
        [tipId]
      );
      res.json({ liked: true });
    }
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// DELETE /api/community/:tipId
// Delete your own tip
router.delete('/:tipId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { tipId } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM community_tips WHERE id = $1 AND user_id = $2 RETURNING id',
      [tipId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tip not found or not yours' });
    }

    res.json({ message: 'Tip deleted' });
  } catch (err) {
    console.error('Delete tip error:', err);
    res.status(500).json({ error: 'Failed to delete tip' });
  }
});

module.exports = router;