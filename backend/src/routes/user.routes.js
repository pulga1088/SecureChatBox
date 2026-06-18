import express from 'express';
import { getUsers, updateProfile } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware to all user routes
router.use(protect);

router.get('/', getUsers);
router.put('/profile', updateProfile);

export default router;
