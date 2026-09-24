/**
 * Attendance Validators
 * express-validator chains for attendance routes.
 */

const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate');

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * POST /api/attendance — mark single attendance
 */
const markAttendanceValidator = [
  body('studentId')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid student ID'),

  body('classId')
    .notEmpty().withMessage('Class ID is required')
    .isMongoId().withMessage('Invalid class ID'),

  body('date')
    .notEmpty().withMessage('Date is required')
    .matches(DATE_REGEX).withMessage('Date must be in YYYY-MM-DD format'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Present', 'Absent']).withMessage("Status must be 'Present' or 'Absent'"),

  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Remarks cannot exceed 300 characters'),

  validate,
];

/**
 * POST /api/attendance/bulk — bulk mark for whole class
 */
const bulkMarkAttendanceValidator = [
  body('classId')
    .notEmpty().withMessage('Class ID is required')
    .isMongoId().withMessage('Invalid class ID'),

  body('date')
    .notEmpty().withMessage('Date is required')
    .matches(DATE_REGEX).withMessage('Date must be in YYYY-MM-DD format'),

  body('entries')
    .isArray({ min: 1 }).withMessage('Entries must be a non-empty array'),

  body('entries.*.studentId')
    .notEmpty().withMessage('Each entry must have a studentId')
    .isMongoId().withMessage('Each studentId must be a valid MongoDB ID'),

  body('entries.*.status')
    .notEmpty().withMessage('Each entry must have a status')
    .isIn(['Present', 'Absent']).withMessage("Each status must be 'Present' or 'Absent'"),

  body('entries.*.remarks')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Remarks cannot exceed 300 characters'),

  validate,
];

/**
 * PUT /api/attendance/:id — update single record
 */
const updateAttendanceValidator = [
  param('id').isMongoId().withMessage('Invalid attendance record ID'),

  body('status')
    .optional()
    .isIn(['Present', 'Absent']).withMessage("Status must be 'Present' or 'Absent'"),

  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Remarks cannot exceed 300 characters'),

  validate,
];

/**
 * GET /api/attendance/class/:classId/date/:date
 */
const classDateParamValidator = [
  param('classId').isMongoId().withMessage('Invalid class ID'),
  param('date').matches(DATE_REGEX).withMessage('Date must be in YYYY-MM-DD format'),
  validate,
];

/**
 * GET /api/attendance/student/:studentId
 */
const studentParamValidator = [
  param('studentId').isMongoId().withMessage('Invalid student ID'),
  validate,
];

/**
 * GET /api/attendance — list query validation
 */
const listAttendanceValidator = [
  query('classId')
    .optional()
    .isMongoId().withMessage('Invalid class ID'),

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
    .isIn(['Present', 'Absent', 'All']).withMessage("Status must be 'Present', 'Absent', or 'All'"),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 200 }).withMessage('Limit must be between 1 and 200'),

  validate,
];

module.exports = {
  markAttendanceValidator,
  bulkMarkAttendanceValidator,
  updateAttendanceValidator,
  classDateParamValidator,
  studentParamValidator,
  listAttendanceValidator,
};
