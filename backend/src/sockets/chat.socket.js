import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import Chat from '../models/chat.model.js';

// Map of userId -> Set of socketIds
const activeConnections = new Map();

export const registerSocketHandlers = (io) => {
  // Socket.io JWT Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication failed: Token missing'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch user from DB
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication failed: User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      return next(new Error('Authentication failed: Token invalid'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`Socket client connected: ${socket.id} (User: ${socket.user.phone || socket.user.email})`);

    // Join user-specific room
    socket.join(userId);

    // Track active connection
    if (!activeConnections.has(userId)) {
      activeConnections.set(userId, new Set());
    }
    activeConnections.get(userId).add(socket.id);

    // Broadcast online status if this is the user's first connection
    if (activeConnections.get(userId).size === 1) {
      socket.broadcast.emit('presence_status', {
        userId,
        status: 'online',
      });
    }

    // Send the list of currently online users to the newly connected user
    socket.emit('online_users_list', Array.from(activeConnections.keys()));

    /**
     * Send Real-Time Message
     */
    socket.on('send_message', async (payload, callback) => {
      try {
        const { chatId, recipientId, text } = payload;

        if (!chatId || !recipientId || !text) {
          if (callback) callback({ status: 'error', message: 'Missing parameters' });
          return;
        }

        // 1. Save message to MongoDB
        const message = await Message.create({
          sender: userId,
          receiver: recipientId,
          text,
          delivered: true,
          read: false,
        });

        // 2. Update chat's lastMessage reference
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
        });

        // 3. Emit message to recipient (other) and sender (me) separately to ensure correct UI states
        io.to(userId).emit('receive_message', {
          chatId,
          message: {
            id: message._id.toString(),
            sender: 'me',
            text: message.text,
            timestamp: message.timestamp,
            status: 'delivered',
          },
        });

        io.to(recipientId).emit('receive_message', {
          chatId,
          message: {
            id: message._id.toString(),
            sender: 'other',
            senderId: userId, // Include sender's user ID for navigating from notification
            senderName: socket.user.name, // Include sender's name for real-time notifications
            text: message.text,
            timestamp: message.timestamp,
            status: 'delivered',
          },
        });

        if (callback) callback({ status: 'success', messageId: message._id.toString() });
      } catch (error) {
        console.error('Error in send_message socket handler:', error);
        if (callback) callback({ status: 'error', message: 'Server failed to deliver message' });
      }
    });

    /**
     * Typing Status Indicator
     */
    socket.on('typing', (payload) => {
      const { chatId, recipientId, isTyping } = payload;
      if (chatId && recipientId) {
        io.to(recipientId).emit('typing_status', {
          chatId,
          senderId: userId,
          isTyping,
        });
      }
    });

    /**
     * Read Receipts
     */
    socket.on('read_receipt', async (payload) => {
      try {
        const { chatId, senderId } = payload;
        if (!chatId || !senderId) return;

        // Mark all messages from this sender to me as read
        await Message.updateMany(
          { sender: senderId, receiver: userId, read: false },
          { $set: { read: true } }
        );

        // Notify the sender that their messages have been read
        io.to(senderId).emit('messages_read_sync', {
          chatId,
          readerId: userId,
        });
      } catch (error) {
        console.error('Error updating read receipts:', error);
      }
    });

    /**
     * Disconnect
     */
    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id} (User: ${socket.user.phone || socket.user.email})`);
      
      const userSockets = activeConnections.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          activeConnections.delete(userId);
          // Broadcast presence change to other users
          socket.broadcast.emit('presence_status', {
            userId,
            status: 'offline',
          });
        }
      }
    });
  });
};
