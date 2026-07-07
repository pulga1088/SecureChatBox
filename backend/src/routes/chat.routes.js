import express from 'express';
import { getChats, getOrCreateChat, getMessages, deleteMessage, clearChat, deleteChat } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware to all chat routes
router.use(protect);

router.get('/', getChats);
router.post('/', getOrCreateChat);
router.get('/:chatId/messages', getMessages);
router.delete('/messages/:messageId', deleteMessage);
router.delete('/:chatId/messages', clearChat);
router.delete('/:chatId', deleteChat);

export default router;
