import mongoose from 'mongoose';
import dns from 'dns';
import { config } from '../config.js';

let isConnected = false;

// Ensure DNS resolution works for mongodb+srv:// on systems where default DNS is 127.0.0.1
try {
  const currentServers = dns.getServers();
  if (currentServers && currentServers.join(',') === '127.0.0.1') {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  }
} catch (e) {
  // ignore DNS setup errors
}

export async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  const primaryUri = config.mongoUri;
  const localUris = [
    'mongodb://127.0.0.1:27017/sarathi-ai',
    'mongodb://localhost:27017/sarathi-ai'
  ];

  // Try primary URI first if configured
  if (primaryUri) {
    try {
      await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 3500,
      });
      isConnected = true;
      global.dbError = null;
      console.log('✅ MongoDB connected successfully to primary cluster:', mongoose.connection.host);
      return;
    } catch (err) {
      console.warn('⚠️ Primary MongoDB cluster connection failed (' + err.message + '). Automatically falling back to local database...');
      global.dbError = err.message;
    }
  }

  // Try local MongoDB fallbacks
  for (const localUri of localUris) {
    if (localUri === primaryUri) continue;
    try {
      await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 3000,
      });
      isConnected = true;
      global.dbError = null;
      console.log('✅ MongoDB connected successfully to local fallback:', mongoose.connection.host);
      return;
    } catch (localErr) {
      global.dbError = localErr.message;
      // try next fallback
    }
  }

  console.error('❌ All MongoDB connection attempts failed. Please ensure local MongoDB is running (`mongod`) or check MONGODB_URI.');
  // Set lower buffer timeout so login/signup fail fast with clear error instead of hanging for 10s
  mongoose.set('bufferTimeoutMS', 2000);
}

export { mongoose };
