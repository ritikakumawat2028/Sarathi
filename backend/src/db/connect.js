import mongoose from 'mongoose';
import { config } from '../config.js';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const uri = config.mongoUri;
  if (!uri) {
    console.warn('⚠️  MONGODB_URI not set. Falling back to local: mongodb://localhost:27017/sarathi-ai');
  }

  try {
    await mongoose.connect(uri || 'mongodb://localhost:27017/sarathi-ai', {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('✅ MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   Make sure MongoDB is running or MONGODB_URI is set in backend/.env');
    // Don't crash the server — it can still serve scheme data from cache/seed
  }
}

export { mongoose };
