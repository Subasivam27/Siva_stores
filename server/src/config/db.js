const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/siva_department_store';

  try {
    // Attempt standard connection to MongoDB
    console.log(`Connecting to MongoDB at: ${primaryUri}...`);
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout to fallback if no local Mongo daemon
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`[Database Warning] Standard MongoDB connection failed: ${err.message}`);
    console.log('[Database] Initializing MongoDB Memory Server fallback for zero-config execution...');

    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] MongoDB Memory Server Connected: ${conn.connection.host} (${memoryUri})`);
    } catch (memoryErr) {
      console.error(`[Database Error] Failed to initialize in-memory MongoDB: ${memoryErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
