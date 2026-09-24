/**
 * Student Validators
 * express-validator chains for student management routes.
 */

const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate');

/**
 * POST /api/students — create student
 */
const createStudentValidator = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),

  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .toDate()
    .custom((value) => {
      if (value >= new Date()) throw new Error('Date of birth must be in the past');
      return true;
    }),

  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),

  body('classId')
    .notEmpty().withMessage('Class is required')
    .isMongoId().withMessage('Invalid class ID'),

  body('parentId')
    .notEmpty().withMessage('Parent is required')
    .isMongoId().withMessage('Invalid parent ID'),

  body('admissionDate')
    .notEmpty().withMessage('Admission date is required')
    .isISO8601().withMessage('Admission date must be a valid date (YYYY-MM-DD)')
    .toDate(),

  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Student ID must be between 3 and 30 characters'),

  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''])
    .withMessage('Invalid blood group'),

  body('totalFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Total fee must be a non-negative number'),

  body('paidAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Paid amount must be a non-negative number'),

  body('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),

  body('rollNo')
    .optional()
    .trim()
    .isLength({ max: 10 }).withMessage('Roll number cannot exceed 10 characters'),

  validate,
];

/**
 * PUT /api/students/:id — update student
 */
const updateStudentValidator = [
  param('id').isMongoId().withMessage('Invalid student ID'),

  body('firstName')
    .optional().trim()
    .isLength({ min: 1, max: 50 }).withMessage('First name cannot exceed 50 characters'),

  body('lastName')
    .optional().trim()
    .isLength({ min: 1, max: 50 }).withMessage('Last name cannot exceed 50 characters'),

  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Date of birth must be a valid date')
    .toDate()
    .custom((value) => {
      if (value >= new Date()) throw new Error('Date of birth must be in the past');
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),

  body('classId')
    .optional()
    .isMongoId().withMessage('Invalid class ID'),

  body('parentId')
    .optional()
    .isMongoId().withMessage('Invalid parent ID'),

  body('admissionDate')
    .optional()
    .isISO8601().withMessage('Admission date must be a valid date')
    .toDate(),

  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''])
    .withMessage('Invalid blood group'),

  body('totalFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Total fee must be a non-negative number'),

  body('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),

  validate,
];

/**
 * GET/DELETE/PATCH /:id — validate id param
 */
const idParamValidator = [
  param('id').isMongoId().withMessage('Invalid student ID'),
  validate,
];

/**
 * GET /api/students/by-class/:classId — validate classId param
 */
const classIdParamValidator = [
  param('classId').isMongoId().withMessage('Invalid class ID'),
  validate,
];

/**
 * GET /api/students — list query validation
 */
const listStudentValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['Active', 'Inactive', 'All']).withMessage('Status must be Active, Inactive, or All'),

  query('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', 'All']).withMessage('Gender must be Male, Female, Other, or All'),

  validate,
];

module.exports = {
  createStudentValidator,
  updateStudentValidator,
  idParamValidator,
  classIdParamValidator,
  listStudentValidator,
};
