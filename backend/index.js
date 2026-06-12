require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

// Apply middlewares
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Set up Socket.io for Real-Time Chat
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this to your frontend URL
    methods: ['GET', 'POST']
  }
});

// Import Message model to save chats offline
const Message = require('./models/Message');

// To keep track of who is currently online (UserId -> SocketId)
const onlineUsers = new Map();

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. User comes online
  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
    
    // Optional: Notify others that this user is online
    io.emit('user_status', { userId, status: 'online' });
  });

  // 2. User sends a private message
  socket.on('send_message', async (data) => {
    /*
      data expects:
      { senderId, receiverId, content }
      (content is an encrypted string!)
    */
    try {
      // Save message to MongoDB so they can get it if they are offline
      const newMessage = await Message.create({
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        status: 'sent'
      });

      // Check if receiver is online right now
      const receiverSocketId = onlineUsers.get(data.receiverId);

      if (receiverSocketId) {
        // Push message instantly to the receiver
        io.to(receiverSocketId).emit('receive_message', newMessage);
        
        // Update status to delivered
        newMessage.status = 'delivered';
        await newMessage.save();
        
        // Let the sender know it was delivered
        socket.emit('message_status', { messageId: newMessage._id, status: 'delivered' });
      }
    } catch (err) {
      console.error('Error saving/sending message:', err);
    }
  });

  // 3. Mark messages as read
  socket.on('mark_read', async ({ senderId, receiverId }) => {
    try {
      // receiverId is the person marking messages as read (current user)
      // senderId is the person who sent the messages
      await Message.updateMany(
        { senderId: senderId, receiverId: receiverId, status: { $ne: 'read' } },
        { $set: { status: 'read' } }
      );

      // Notify the original sender that their messages were read
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messages_read', { readerId: receiverId });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // 4. Typing Indicators
  socket.on('typing', ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing', { senderId });
    }
  });

  socket.on('stop_typing', ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('stop_typing', { senderId });
    }
  });

  // 5. User disconnects
  socket.on('disconnect', () => {
    // Find the user who disconnected and remove them from the map
    let disconnectedUserId = null;
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }
    
    if (disconnectedUserId) {
      console.log(`User ${disconnectedUserId} disconnected`);
      io.emit('user_status', { userId: disconnectedUserId, status: 'offline' });
    }
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Start the server only after DB connection
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
