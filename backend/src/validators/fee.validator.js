/**
 * Fee Validators
 * express-validator chains for fee structure routes.
 */

const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate');

/**
 * POST /api/fees — create fee structure
 */
const createFeeValidator = [
  body('classId')
    .notEmpty().withMessage('Class ID is required')
    .isMongoId().withMessage('Invalid class ID'),

  body('academicYear')
    .trim()
    .notEmpty().withMessage('Academic year is required')
    .matches(/^\d{4}[–\-]\d{2,4}$/).withMessage('Academic year must be in format YYYY–YY (e.g. 2026–27)'),

  body('totalAnnualFee')
    .notEmpty().withMessage('Total annual fee is required')
    .isFloat({ min: 0 }).withMessage('Total annual fee must be a non-negative number'),

  body('term1Fee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Term 1 fee must be a non-negative number'),

  body('term2Fee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Term 2 fee must be a non-negative number'),

  body('labTechFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Lab/tech fee must be a non-negative number'),

  body('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),

  validate,
];

/**
 * PUT /api/fees/:id — update fee structure
 */
const updateFeeValidator = [
  param('id').isMongoId().withMessage('Invalid fee structure ID'),

  body('classId')
    .optional()
    .isMongoId().withMessage('Invalid class ID'),

  body('academicYear')
    .optional()
    .trim()
    .matches(/^\d{4}[–\-]\d{2,4}$/).withMessage('Academic year must be in format YYYY–YY (e.g. 2026–27)'),

  body('totalAnnualFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Total annual fee must be a non-negative number'),

  body('term1Fee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Term 1 fee must be a non-negative number'),

  body('term2Fee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Term 2 fee must be a non-negative number'),

  body('labTechFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Lab/tech fee must be a non-negative number'),

  body('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),

  validate,
];

/**
 * GET/DELETE /:id — id param validation
 */
const idParamValidator = [
  param('id').isMongoId().withMessage('Invalid fee structure ID'),
  validate,
];

/**
 * GET /api/fees — list query validation
 */
const listFeeValidator = [
  query('status')
    .optional()
    .isIn(['Active', 'Inactive', 'All']).withMessage('Status must be Active, Inactive, or All'),
  query('classId')
    .optional()
    .isMongoId().withMessage('Invalid class ID'),
  validate,
];

/**
 * GET /api/fees/pending — pending fee query validation
 */
const pendingFeeValidator = [
  query('classId')
    .optional()
    .isMongoId().withMessage('Invalid class ID'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate,
];

module.exports = {
  createFeeValidator,
  updateFeeValidator,
  idParamValidator,
  listFeeValidator,
  pendingFeeValidator,
};
