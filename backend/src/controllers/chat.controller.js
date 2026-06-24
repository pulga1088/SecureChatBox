import Chat from '../models/chat.model.js';
import Message from '../models/message.model.js';

/**
 * Fetch all chat threads for the current user.
 * Populates participants and lastMessage.
 */
export const getChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({
      participants: userId,
    })
      .populate('participants', 'name phone email profileImage status')
      .populate({
        path: 'lastMessage',
        select: 'sender receiver text timestamp read delivered',
      })
      .sort({ updatedAt: -1 });

    // Calculate unreadCount for each chat dynamically
    const chatsWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const otherParticipant = chat.participants.find(
          (p) => p._id.toString() !== userId
        );
        let unreadCount = 0;
        if (otherParticipant) {
          unreadCount = await Message.countDocuments({
            sender: otherParticipant._id,
            receiver: userId,
            read: false,
          });
        }
        const chatObj = chat.toObject();
        chatObj.unreadCount = unreadCount;
        return chatObj;
      })
    );

    return res.json({ status: 'success', chats: chatsWithUnreadCount });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch chats' });
  }
};

/**
 * Retrieve or create a 1-on-1 chat room with another user.
 */
export const getOrCreateChat = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user.id;

    if (!recipientId) {
      return res.status(400).json({ status: 'error', message: 'recipientId is required' });
    }

    // Look for existing chat between these exact two participants
    let chat = await Chat.findOne({
      participants: { $all: [senderId, recipientId], $size: 2 },
    })
      .populate('participants', 'name phone email profileImage status')
      .populate('lastMessage');

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        participants: [senderId, recipientId],
      });
      chat = await Chat.findById(chat._id).populate('participants', 'name phone email profileImage status');
    }

    const otherParticipant = chat.participants.find(
      (p) => p._id.toString() !== senderId
    );
    let unreadCount = 0;
    if (otherParticipant) {
      unreadCount = await Message.countDocuments({
        sender: otherParticipant._id,
        receiver: senderId,
        read: false,
      });
    }

    const chatObj = chat.toObject();
    chatObj.unreadCount = unreadCount;

    return res.json({ status: 'success', chat: chatObj });
  } catch (error) {
    console.error('Error getting/creating chat:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to get/create chat' });
  }
};

/**
 * Retrieve message history for a specific chat.
 */
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ status: 'error', message: 'Chat thread not found' });
    }

    // Ensure the requester is a participant of this chat
    const isParticipant = chat.participants.some(p => p.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ status: 'error', message: 'Access denied' });
    }

    if (chat.participants.length < 2) {
      return res.json({ status: 'success', messages: [] });
    }

    const [p1, p2] = chat.participants;

    const messages = await Message.find({
      $or: [
        { sender: p1, receiver: p2 },
        { sender: p2, receiver: p1 },
      ],
    }).sort({ timestamp: 1 }); // Oldest first for normal stream

    return res.json({ status: 'success', messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch messages' });
  }
};
