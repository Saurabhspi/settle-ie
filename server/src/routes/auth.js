const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const { sendWelcomeEmail, sendVerificationEmail } = require('../services/emailService');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body;

  // Basic validation
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // GET /api/auth/verify-email?token=xxx
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  try {
    // Find user with this token that hasn't expired
    const result = await db.query(
      `SELECT id, email FROM users 
       WHERE verification_token = $1 
       AND verification_expires > NOW()
       AND is_verified = FALSE`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid or expired verification link. Please register again.' 
      });
    }

    const user = result.rows[0];

// Mark as verified and clear token
await db.query(
  `UPDATE users 
   SET is_verified = TRUE, 
       verification_token = NULL,
       verification_expires = NULL
   WHERE id = $1`,
  [user.id]
);

// Send welcome email
sendWelcomeEmail(user.email, user.full_name)
  .catch(err => console.error('Welcome email failed:', err.message));

// Create JWT so user is automatically logged in
const token = jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

res.json({
  message: 'Email verified successfully! Setting up your roadmap...',
  token,
  user: {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
  },
}); 

  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});
  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  // Block disposable email domains
  const blockedDomains = [
    'mailinator.com', 'tempmail.com', 'throwaway.email',
    'guerrillamail.com', 'sharklasers.com', 'yopmail.com',
    'trashmail.com', '10minutemail.com', 'fakeinbox.com',
  ];
  const emailDomain = email.split('@')[1].toLowerCase();
  if (blockedDomains.includes(emailDomain)) {
    return res.status(400).json({
      error: 'Please use a real email address — temporary emails are not allowed',
    });
  }

  try {
    // Check if user already exists
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Insert new user into database
    const result = await db.query(
      `INSERT INTO users 
         (email, password_hash, full_name, verification_token, verification_expires)
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, full_name`,
      [email, password_hash, full_name, verificationToken, verificationExpires]
    );

    const user = result.rows[0];

    // Send verification email
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    sendVerificationEmail(user.email, user.full_name, verifyUrl)
      .catch(err => console.error('Verification email failed:', err.message));

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user,
      message: 'Please check your email to verify your account',
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/verify-email?token=xxx
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  try {
    const result = await db.query(
      `SELECT id, email, full_name FROM users 
       WHERE verification_token = $1 
       AND verification_expires > NOW()
       AND is_verified = FALSE`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: 'Invalid or expired verification link. Please register again.',
      });
    }

    const user = result.rows[0];

// Mark as verified and clear token
await db.query(
  `UPDATE users 
   SET is_verified = TRUE, 
       verification_token = NULL,
       verification_expires = NULL
   WHERE id = $1`,
  [user.id]
);

// Send welcome email
sendWelcomeEmail(user.email, user.full_name)
  .catch(err => console.error('Welcome email failed:', err.message));

// Create JWT so user is automatically logged in
const token = jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

res.json({
  message: 'Email verified successfully! Setting up your roadmap...',
  token,
  user: {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
  },
});

  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, email, full_name, nationality, visa_type, 
              arrival_date, has_onboarded, is_verified
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;