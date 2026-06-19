import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Added connection options to fail faster if DB is unreachable
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Backend will continue running, but database operations might hang if not handled.');
    // Set bufferCommands to false to fail fast on DB operations if not connected
    mongoose.set('bufferCommands', false);
  }
};

export default connectDB;
