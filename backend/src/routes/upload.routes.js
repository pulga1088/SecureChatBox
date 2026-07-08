import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth.middleware.js';
import File from '../models/file.model.js';

const router = express.Router();

// Configure memory storage instead of disk storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * @route   POST /api/upload
 * @desc    Upload file/image and save binary payload to MongoDB
 * @access  Private
 */
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    // Generate a reference filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + path.extname(req.file.originalname);

    // Create file document with binary buffer data
    const fileDoc = new File({
      filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
      uploadedBy: req.user._id,
    });

    await fileDoc.save();

    // Construct backend dynamic serving URL referencing the Mongo Document ID
    const fileUrl = `${req.protocol}://${req.get('host')}/api/upload/${fileDoc._id}`;

    return res.json({
      status: 'success',
      fileUrl,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to upload file' });
  }
});

/**
 * @route   GET /api/upload/:fileId
 * @desc    Publicly retrieve and stream binary file data directly from MongoDB
 * @access  Public
 */
router.get('/:fileId', async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ status: 'error', message: 'File not found' });
    }

    // Serve binary payload directly with original content headers and aggressive cache settings
    res.set('Content-Type', file.mimeType);
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    return res.send(file.data);
  } catch (error) {
    console.error('Fetch file error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ status: 'error', message: 'File not found' });
    }
    return res.status(500).json({ status: 'error', message: 'Failed to fetch file' });
  }
});

export default router;
