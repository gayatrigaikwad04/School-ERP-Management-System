/**
 * express-validator result checker middleware.
 *
 * Placed at the end of every validator array.
 * If there are validation errors it short-circuits with 400.
 * Otherwise it calls next().
 */

const { validationResult } = require('express-validator');
const HTTP_STATUS = require('../constants/httpStatus');

const validate = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  return next();
};

module.exports = { validate };
