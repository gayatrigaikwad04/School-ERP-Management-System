/**
 * MongoDB connection using Mongoose.
 * Called once at server startup; the connection is reused by all models.
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set.');
  }

  const options = {
    // Mongoose 8 no longer needs useNewUrlParser / useUnifiedTopology
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    const conn = await mongoose.connect(uri, options);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    throw error; // Bubble up so server.js can exit(1)
  }

  // Connection event listeners
  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB runtime error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Attempting reconnect…');
  });
};

/**
 * Gracefully close the MongoDB connection.
 * Used in test teardowns and SIGTERM handler.
 */
const disconnectDB = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed.');
};

module.exports = { connectDB, disconnectDB };
