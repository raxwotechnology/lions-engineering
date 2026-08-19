const mongoose = require('mongoose');
const seedDB = require('../utils/seedDB');

/**
 * Connects the Express backend application to MongoDB Atlas via Mongoose.
 * Reads MONGO_URI from the environment variables (.env file).
 */
const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI;

    if (!connStr || connStr === 'MY_CONNECTION_STRING') {
      console.log('ℹ️  MONGO_URI in .env is default or missing. Please update backend/.env with your actual MongoDB Atlas connection string.');
      console.log('ℹ️  Running server in initial mockup mode.');
      return;
    }

    // Set connection options
    const conn = await mongoose.connect(connStr);

    console.log(`✅ MongoDB Atlas Connected Successfully!`);
    console.log(`📡 Host: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // Auto-seed initial collections if database is empty
    await seedDB();

    // Register Mongoose connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error(`❌ Mongoose Connection Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB connection disconnected.');
    });

  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Failed!`);
    console.error(`Reason: ${error.message}`);
  }
};

module.exports = connectDB;

