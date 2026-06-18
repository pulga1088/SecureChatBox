import express from 'express';
import { getChats, getOrCreateChat, getMessages } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware to all chat routes
router.use(protect);

router.get('/', getChats);
router.post('/', getOrCreateChat);
router.get('/:chatId/messages', getMessages);

export default router;
