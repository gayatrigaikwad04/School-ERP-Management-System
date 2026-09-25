/**
 * Vercel serverless entry point.
 *
 * Vercel expects a default export that is a Node.js HTTP request handler.
 * We connect to MongoDB once (cached across warm invocations) then hand off
 * every request to the Express app.
 */

require('dotenv').config();

const app = require('../src/app');
const { connectDB } = require('../src/config/database');

// Cache the DB connection across warm Lambda invocations so we don't
// open a new connection on every request.
let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};
