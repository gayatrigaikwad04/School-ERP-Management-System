/**
 * Payment Validators
 * express-validator chains for payment routes.
 */

const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate');

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card', 'Other'];

/**
 * POST /api/payments — record a new payment
 */
const createPaymentValidator = [
  body('studentId')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid student ID'),

  body('amountPaid')
    .notEmpty().withMessage('Amount paid is required')
    .isFloat({ min: 1 }).withMessage('Amount paid must be greater than zero'),

  body('paymentDate')
    .optional()
    .matches(DATE_REGEX).withMessage('Payment date must be in YYYY-MM-DD format'),

  body('paymentMode')
    .optional()
    .isIn(PAYMENT_MODES).withMessage(`Payment mode must be one of: ${PAYMENT_MODES.join(', ')}`),

  body('refNumber')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Reference number cannot exceed 100 characters'),

  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Remarks cannot exceed 500 characters'),

  validate,
];

/**
 * GET/... /:id — validate id param
 */
const idParamValidator = [
  param('id').isMongoId().withMessage('Invalid payment ID'),
  validate,
];

/**
 * GET /api/payments/student/:studentId — validate studentId param
 */
const studentIdParamValidator = [
  param('studentId').isMongoId().withMessage('Invalid student ID'),
  validate,
];

/**
 * GET /api/payments — list query validation
 */
const listPaymentValidator = [
  query('studentId')
    .optional()
    .isMongoId().withMessage('Invalid student ID'),

  query('mode')
    .optional()
    .custom((val) => {
      if (val !== 'All' && !PAYMENT_MODES.includes(val)) {
        throw new Error(`Mode must be one of: All, ${PAYMENT_MODES.join(', ')}`);
      }
      return true;
    }),

  query('date')
    .optional()
    .matches(DATE_REGEX).withMessage('Date must be in YYYY-MM-DD format'),

  query('startDate')
    .optional()
    .matches(DATE_REGEX).withMessage('Start date must be in YYYY-MM-DD format'),

  query('endDate')
    .optional()
    .matches(DATE_REGEX).withMessage('End date must be in YYYY-MM-DD format'),

  query('status')
    .optional()
    .isIn(['Verified', 'Pending', 'Cancelled', 'All']).withMessage('Invalid status'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  validate,
];

module.exports = {
  createPaymentValidator,
  idParamValidator,
  studentIdParamValidator,
  listPaymentValidator,
};
