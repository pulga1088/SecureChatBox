import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true, // Will store the AES-256 encrypted string
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  delivered: {
    type: Boolean,
    default: false,
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
