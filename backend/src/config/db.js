import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Warning: Database not connected yet. (${error.message})`);
    console.log('Backend will continue running. Please configure MONGODB_URI in your .env file.');
  }
};

export default connectDB;
