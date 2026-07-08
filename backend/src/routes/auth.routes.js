import express from 'express';
import { 
  verifyFirebaseToken, 
  getProfile, 
  registerNfcCard, 
  verifyNfcCard 
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/verify-token', verifyFirebaseToken);
router.get('/profile', protect, getProfile);
router.post('/nfc/register', protect, registerNfcCard);
router.post('/nfc/verify', protect, verifyNfcCard);

export default router;
