/**
 * Class Validators
 * express-validator chains for class management routes.
 */

const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate');

/**
 * POST /api/classes — create a new class
 */
const createClassValidator = [
  body('className')
    .trim()
    .notEmpty().withMessage('Class name is required')
    .isLength({ max: 50 }).withMessage('Class name cannot exceed 50 characters'),

  body('section')
    .trim()
    .notEmpty().withMessage('Section is required')
    .isLength({ max: 5 }).withMessage('Section cannot exceed 5 characters')
    .toUpperCase(),

  body('academicYear')
    .trim()
    .notEmpty().withMessage('Academic year is required')
    .matches(/^\d{4}[–\-]\d{2,4}$/).withMessage('Academic year must be in format YYYY–YY (e.g. 2026–27)'),

  body('capacity')
    .optional()
    .isInt({ min: 1, max: 200 }).withMessage('Capacity must be between 1 and 200'),

  body('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),

  validate,
];

/**
 * PUT /api/classes/:id — update existing class
 */
const updateClassValidator = [
  param('id')
    .isMongoId().withMessage('Invalid class ID'),

  body('className')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Class name cannot exceed 50 characters'),

  body('section')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5 }).withMessage('Section cannot exceed 5 characters'),

  body('academicYear')
    .optional()
    .trim()
    .matches(/^\d{4}[–\-]\d{2,4}$/).withMessage('Academic year must be in format YYYY–YY (e.g. 2026–27)'),

  body('capacity')
    .optional()
    .isInt({ min: 1, max: 200 }).withMessage('Capacity must be between 1 and 200'),

  body('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),

  validate,
];

/**
 * DELETE / GET /:id — validate MongoDB ObjectId param
 */
const idParamValidator = [
  param('id').isMongoId().withMessage('Invalid class ID'),
  validate,
];

/**
 * GET /api/classes — query param validation
 */
const listClassValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['Active', 'Inactive', 'All']).withMessage('Status must be Active, Inactive, or All'),

  validate,
];

module.exports = {
  createClassValidator,
  updateClassValidator,
  idParamValidator,
  listClassValidator,
};
