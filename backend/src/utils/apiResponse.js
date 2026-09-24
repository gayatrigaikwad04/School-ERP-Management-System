/**
 * Centralised API response helpers.
 * Every controller uses these to guarantee a consistent response shape.
 *
 * Success:  { success: true,  message, data, meta }
 * Error:    { success: false, message, errors }
 */

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {*} data
 * @param {object} [meta]  - pagination metadata etc.
 */
const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {Array}  [errors]
 */
const sendError = (res, statusCode, message, errors = []) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

module.exports = { sendSuccess, sendError };
