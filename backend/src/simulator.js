import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { io } from 'socket.io-client';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import Message from './models/message.model.js';
import Chat from './models/chat.model.js';
import { getMongoUri } from './config/mongo.js';

dotenv.config();

const MONGODB_URI = getMongoUri();
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key_change_in_production_12345';
const PORT = process.env.PORT || 5001;
const SOCKET_URL = `http://localhost:${PORT}`;

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected.');

    // Find or create bot user
    let bot = await User.findOne({ email: 'bot@securechat.com' });
    if (!bot) {
      bot = await User.create({
        name: 'Secure Bot 🤖',
        email: 'bot@securechat.com',
        phone: '+919999999999',
        location: 'Localhost',
        status: 'Online and ready to test real-time chat!',
        profileImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
      });
      console.log('Created Secure Bot user in MongoDB.');
    } else {
      console.log('Secure Bot user found in MongoDB.');
    }

    // Generate JWT
    const token = jwt.sign(
      { id: bot._id, phone: bot.phone, email: bot.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    console.log('Signed JWT token for Secure Bot.');

    // Connect to Socket.IO
    console.log(`Connecting to Socket.IO server at ${SOCKET_URL}...`);
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('\n=============================================');
      console.log('  🤖 SECURE BOT IS NOW ONLINE & LISTENING 🤖');
      console.log('=============================================');
      console.log('Find me in the "New Chat" search by searching for:');
      console.log(' -> "Secure Bot" or "bot@securechat.com"');
      console.log('Once you send me a message, I will read it and reply.');
      console.log('=============================================\n');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket Connection Error:', error.message);
    });

    socket.on('receive_message', async (data) => {
      const { chatId, message } = data;
      
      // Since it's broadcast to both sender and receiver, let's identify if the sender of this message is indeed another user
      if (message.sender === 'me') {
        return;
      }

      console.log(`[Message Received] Chat: ${chatId} | Text: "${message.text}"`);

      try {
        // Query the chat to find who the other participant is
        const chatObj = await Chat.findById(chatId);
        if (!chatObj) {
          console.error(`Chat thread ${chatId} not found in database.`);
          return;
        }

        const otherParticipantId = chatObj.participants.find(
          (id) => id.toString() !== bot._id.toString()
        );

        if (!otherParticipantId) {
          console.error(`Could not find the other participant in chat ${chatId}`);
          return;
        }

        const recipientId = otherParticipantId.toString();

        // 1. Send read receipt after 800ms
        setTimeout(() => {
          console.log(`[Read Receipt] Sending read receipt for chat ${chatId}`);
          socket.emit('read_receipt', { chatId, senderId: recipientId });
        }, 800);

        // 2. Start typing indicator after 1.5s
        setTimeout(() => {
          console.log('[Typing] Starting typing indicator...');
          socket.emit('typing', { chatId, recipientId, isTyping: true });
        }, 1500);

        // 3. Send reply after 3.5s
        setTimeout(() => {
          const responses = [
            "Hello! This is Secure Bot. I'm receiving your messages in real-time! 🚀",
            "Got your message! The Socket.IO connection is working perfectly. 🟢",
            "Did you see my green online indicator and typing status? That's all real-time! ⚡",
            "All communications here are encrypted on transport and saved securely in MongoDB.",
            "Awesome! Everything is working correctly. What should we build next? 🛠️",
            "Beep boop! 🤖 Real-time communication check: Successful!",
          ];
          const randomReply = responses[Math.floor(Math.random() * responses.length)];

          // Stop typing
          socket.emit('typing', { chatId, recipientId, isTyping: false });

          // Send message
          console.log(`[Replying] Sending message to ${recipientId}: "${randomReply}"`);
          socket.emit('send_message', {
            chatId,
            recipientId,
            text: randomReply,
          });
        }, 3500);

      } catch (err) {
        console.error('Error handling received message:', err);
      }
    });

    // Cleanup on exit
    process.on('SIGINT', () => {
      console.log('\nDisconnecting socket and database...');
      socket.disconnect();
      mongoose.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('Error running simulator:', error);
  }
}

run();
