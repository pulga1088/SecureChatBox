import mongoose from 'mongoose';
import Chat from './models/chat.model.js';
import Message from './models/message.model.js';
import User from './models/user.model.js';
import { getMongoUri } from './config/mongo.js';

const MONGODB_URI = getMongoUri();

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const users = await User.find({});
    console.log('--- USERS ---');
    users.forEach(u => console.log(`User: ${u._id} | Name: ${u.name} | Phone: ${u.phone} | Email: ${u.email}`));

    const chats = await Chat.find({});
    console.log('--- CHATS ---');
    chats.forEach(c => console.log(`Chat: ${c._id} | Participants: ${c.participants.join(', ')} | LastMsg: ${c.lastMessage}`));

    const messages = await Message.find({});
    console.log('--- MESSAGES ---');
    messages.forEach(m => console.log(`Msg: ${m._id} | Sender: ${m.sender} | Receiver: ${m.receiver} | Text: ${m.text}`));

    await mongoose.disconnect();
    console.log('Database disconnected.');
  } catch (err) {
    console.error(err);
  }
}

check();
