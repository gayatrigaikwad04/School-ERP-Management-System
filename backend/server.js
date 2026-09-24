/**
 * Server entry point.
 * Loads env vars, connects to MongoDB, then starts Express.
 */

require('dotenv').config();

const app              = require('./src/app');
const { connectDB }    = require('./src/config/database');
const logger           = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info('──────────────────────────────────────');
      logger.info('  🚀  SchoolERP Backend Server');
      logger.info(`  Environment : ${process.env.NODE_ENV || 'development'}`);
      logger.info(`  Port        : ${PORT}`);
      logger.info(`  Health      : http://localhost:${PORT}/api/health`);
      logger.info(`  Client URL  : ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      logger.info('──────────────────────────────────────');
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully…`);
      server.close(async () => {
        const { disconnectDB } = require('./src/config/database');
        await disconnectDB();
        logger.info('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Catch unhandled promise rejections and exceptions
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

startServer();
