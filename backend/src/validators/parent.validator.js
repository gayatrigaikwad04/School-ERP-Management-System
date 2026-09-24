/**
 * Parent Validators
 * express-validator chains for parent management routes.
 */

const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate');

// Indian phone regex: optional +91 prefix, then 10 digits starting with 6-9
// Also accepts international numbers
const PHONE_REGEX = /^(\+91[\s\-]?)?[6-9]\d{9}$|^\+?[1-9]\d{7,14}$/;

/**
 * POST /api/parents — create parent
 */
const createParentValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Parent name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(PHONE_REGEX).withMessage('Please enter a valid phone number'),

  body('parentId')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Parent ID must be between 3 and 30 characters'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Address cannot exceed 300 characters'),

  body('occupation')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Occupation cannot exceed 100 characters'),

  validate,
];

/**
 * PUT /api/parents/:id — update parent
 */
const updateParentValidator = [
  param('id')
    .isMongoId().withMessage('Invalid parent ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(PHONE_REGEX).withMessage('Please enter a valid phone number'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Address cannot exceed 300 characters'),

  body('occupation')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Occupation cannot exceed 100 characters'),

  validate,
];

/**
 * GET/DELETE /:id — validate id param
 */
const idParamValidator = [
  param('id').isMongoId().withMessage('Invalid parent ID'),
  validate,
];

/**
 * GET /api/parents — list query validation
 */
const listParentValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate,
];

module.exports = {
  createParentValidator,
  updateParentValidator,
  idParamValidator,
  listParentValidator,
};
