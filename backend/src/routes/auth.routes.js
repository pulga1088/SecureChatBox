import express from 'express';
import { verifyFirebaseToken, getProfile } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/verify-token', verifyFirebaseToken);
router.get('/profile', protect, getProfile);

export default router;
