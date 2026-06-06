const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { generateRoadmap } = require('../services/roadmapService');

const router = express.Router();

// All routes below are protected — JWT token required
router.use(authMiddleware);

// ─────────────────────────────────────────────
// POST /api/roadmap/onboard
// Called once after user completes onboarding quiz
// ─────────────────────────────────────────────
router.post('/onboard', async (req, res) => {
  const userId = req.user.id; // comes from JWT middleware
  const {
    nationality,
    visa_type,
    employment_status,
    arrival_date,
    has_children,
    has_driving_licence,
  } = req.body;

  // Basic validation
  if (!nationality || !visa_type || !employment_status || !arrival_date) {
    return res.status(400).json({ 
      error: 'Please fill in all required fields' 
    });
  }

  try {
    // Save profile details to users table
    await db.query(
      `UPDATE users SET
        nationality = $1,
        visa_type = $2,
        arrival_date = $3,
        updated_at = NOW()
       WHERE id = $4`,
      [nationality, visa_type, arrival_date, userId]
    );

    // Build the profile object for the roadmap engine
    const profile = {
      nationality,
      employment_status,
      arrival_date,
      has_children: has_children || false,
      has_driving_licence: has_driving_licence || false,
    };

    // Generate and save personalised roadmap
    const stepCount = await generateRoadmap(userId, profile);

    // Mark user as having completed onboarding
   await db.query(
  'UPDATE users SET has_onboarded = TRUE WHERE id = $1',
  [userId]
    );

    res.status(201).json({
      message: `Your roadmap has been created with ${stepCount} steps`,
      step_count: stepCount,
    });
  } catch (err) {
    console.error('Onboard error:', err);
    res.status(500).json({ error: 'Failed to generate roadmap' });
  }
});

// ─────────────────────────────────────────────
// GET /api/roadmap
// Fetches the logged in user's full roadmap
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT * FROM roadmap_steps
       WHERE user_id = $1
       ORDER BY order_index ASC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Fetch roadmap error:', err);
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
});

// ─────────────────────────────────────────────
// GET /api/roadmap/progress
// Returns completion percentage for the dashboard
// ─────────────────────────────────────────────
router.get('/progress', async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'done') as completed
       FROM roadmap_steps
       WHERE user_id = $1`,
      [userId]
    );

    const { total, completed } = result.rows[0];
    const percentage = total > 0 
      ? Math.round((completed / total) * 100) 
      : 0;

    res.json({ total, completed, percentage });
  } catch (err) {
    console.error('Progress error:', err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/roadmap/:stepId
// Updates a single step's status
// ─────────────────────────────────────────────
router.patch('/:stepId', async (req, res) => {
  const userId = req.user.id;
  const { stepId } = req.params;
  const { status } = req.body;

  // Validate status value
  const validStatuses = ['pending', 'in_progress', 'done'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Status must be pending, in_progress, or done' 
    });
  }

  try {
    const result = await db.query(
      `UPDATE roadmap_steps
       SET status = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [status, stepId, userId]
    );

    // If no rows returned, step doesn't exist or belongs to someone else
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Step not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update step error:', err);
    res.status(500).json({ error: 'Failed to update step' });
  }
});

module.exports = router;