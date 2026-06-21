const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

const router = express.Router();

router.use(authMiddleware);

// POST /api/documents/upload
// Uploads a document to Cloudinary and saves metadata to DB
router.post('/upload', upload.single('document'), async (req, res) => {
  const userId = req.user.id;
  const { doc_type } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!doc_type) {
    return res.status(400).json({ error: 'Document type is required' });
  }

  try {
    // req.file is populated by multer after upload to Cloudinary
    const { path: fileUrl, filename: publicId } = req.file;

    // Save document metadata to PostgreSQL
    const result = await db.query(
      `INSERT INTO documents 
         (user_id, doc_type, s3_key, ai_validation)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, doc_type) 
       DO UPDATE SET s3_key = $3, ai_validation = $4, uploaded_at = NOW()
       RETURNING *`,
      [
        userId,
        doc_type,
        fileUrl, // Cloudinary URL
        JSON.stringify({ valid: null, issues: [], status: 'pending' }),
      ]
    );

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: result.rows[0],
      url: fileUrl,
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// GET /api/documents
// Fetches all documents for the logged in user
router.get('/', async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT * FROM documents 
       WHERE user_id = $1 
       ORDER BY uploaded_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// DELETE /api/documents/:docId
// Deletes a document from Cloudinary and DB
router.delete('/:docId', async (req, res) => {
  const userId = req.user.id;
  const { docId } = req.params;

  try {
    // Get document first to get the Cloudinary URL
    const docResult = await db.query(
      `SELECT * FROM documents WHERE id = $1 AND user_id = $2`,
      [docId, userId]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete from DB
    await db.query(
      `DELETE FROM documents WHERE id = $1 AND user_id = $2`,
      [docId, userId]
    );

    res.json({ message: 'Document deleted successfully' });

  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;