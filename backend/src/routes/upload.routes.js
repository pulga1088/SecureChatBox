import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Use memory storage — multer buffers the file in RAM, then we stream it to GridFS
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

/**
 * Helper — returns a GridFSBucket from the active Mongoose connection.
 * We call this lazily (not at startup) so the connection is guaranteed to exist.
 */
const getBucket = () => {
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB is not connected yet');
  return new GridFSBucket(db, { bucketName: 'uploads' });
};

/**
 * POST /api/upload
 * Accepts a multipart/form-data upload with field name "file".
 * Stores the file in GridFS (MongoDB Atlas) and returns its access URL.
 */
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    const bucket = getBucket();

    // Create a readable stream from the in-memory buffer
    const readable = Readable.from(req.file.buffer);

    // Open an upload stream into GridFS
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    // Pipe the buffer into GridFS and await completion
    await new Promise((resolve, reject) => {
      readable.pipe(uploadStream);
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    const fileId = uploadStream.id.toString();
    // Build absolute URL so React Native Image components can use it directly
    const fileUrl = `${req.protocol}://${req.get('host')}/api/upload/${fileId}`;

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
 * GET /api/upload/:id
 * Streams a file out of GridFS by its ObjectId.
 * No auth required so image <uri> tags work directly.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid file ID' });
    }

    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(id);

    // Find file metadata first to set Content-Type header
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ status: 'error', message: 'File not found' });
    }

    const file = files[0];
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Length', file.length);

    // Stream the file to the response
    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on('error', () => {
      res.status(500).json({ status: 'error', message: 'Error streaming file' });
    });
    downloadStream.pipe(res);
  } catch (error) {
    console.error('File download error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve file' });
  }
});

export default router;
