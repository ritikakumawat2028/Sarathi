import mongoose from 'mongoose';
import dns from 'dns';
import { config } from '../config.js';

let isConnected = false;

// Always ensure reliable DNS for MongoDB SRV lookups.
// AWS EC2 uses 169.254.169.253 (Amazon DNS) which often refuses SRV record queries.
// We prepend Google and Cloudflare DNS to ensure _mongodb._tcp SRV records resolve.
try {
  const currentServers = dns.getServers();
  const reliableDns = ['8.8.8.8', '1.1.1.1'];
  const merged = [...new Set([...reliableDns, ...currentServers])];
  dns.setServers(merged);
  console.log('✅ DNS servers set to:', merged.join(', '));
} catch (e) {
  console.warn('⚠️ Could not override DNS servers:', e.message);
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
        serverSelectionTimeoutMS: 10000, // AWS EC2 → Atlas SRV DNS can be slow on first connect
        connectTimeoutMS: 10000,
      });
      isConnected = true;
      global.dbError = null;
      global.primaryDbError = null;
      console.log('✅ MongoDB connected successfully to primary cluster:', mongoose.connection.host);
      return;
    } catch (err) {
      console.warn('⚠️ Primary MongoDB cluster connection failed (' + err.message + '). Automatically falling back to local database...');
      global.dbError = err.message;
      global.primaryDbError = err.message;
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
