import mongoose from 'mongoose';
import { getMongoUri } from './mongo.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(getMongoUri());
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Warning: Database not connected yet. (${error.message})`);
    console.log('Backend will continue running. Please configure MONGODB_URI in your .env file.');
  }
};

export default connectDB;
