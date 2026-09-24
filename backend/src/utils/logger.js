/**
 * Logger utility — wraps Winston for structured logging.
 * Uses console transport in development, file transport in production.
 */

const { createLogger, format, transports } = require('winston');
const path = require('path');

const { combine, timestamp, printf, colorize, errors } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    // Always log to console
    new transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      ),
    }),
  ],
  exitOnError: false,
});

// In production add file transports
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
    })
  );
  logger.add(
    new transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    })
  );
}

module.exports = logger;
