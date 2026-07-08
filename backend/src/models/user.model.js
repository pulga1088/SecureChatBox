import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    sparse: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    sparse: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  profileImage: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'Hey there! I am using Secure Chat.',
  },
  location: {
    type: String,
    default: '',
  },
  nfcUid: {
    type: String,
    sparse: true,
    unique: true,
    trim: true,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;
