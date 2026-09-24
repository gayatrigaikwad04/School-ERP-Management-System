/**
 * Class Controller
 * Thin HTTP layer — delegates to classService.
 */

const classService  = require('../services/class.service');
const { sendSuccess } = require('../utils/apiResponse');
const HTTP_STATUS   = require('../constants/httpStatus');

const classController = {
  /**
   * GET /api/classes
   * Query: search, status, academicYear, page, limit
   */
  getClasses: async (req, res, next) => {
    try {
      const result = await classService.getClasses(req.query);
      return sendSuccess(
        res,
        HTTP_STATUS.OK,
        'Classes fetched successfully',
        result.classes,
        { total: result.total, page: result.page, limit: result.limit }
      );
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/classes/all-active
   * Lightweight list for dropdowns.
   */
  getAllActiveClasses: async (req, res, next) => {
    try {
      const classes = await classService.getAllActiveClasses();
      return sendSuccess(res, HTTP_STATUS.OK, 'Active classes fetched successfully', classes);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/classes/:id
   */
  getClassById: async (req, res, next) => {
    try {
      const cls = await classService.getClassById(req.params.id);
      return sendSuccess(res, HTTP_STATUS.OK, 'Class fetched successfully', cls);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /api/classes
   */
  createClass: async (req, res, next) => {
    try {
      const cls = await classService.createClass(req.body);
      return sendSuccess(res, HTTP_STATUS.CREATED, 'Class created successfully', cls);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * PUT /api/classes/:id
   */
  updateClass: async (req, res, next) => {
    try {
      const cls = await classService.updateClass(req.params.id, req.body);
      return sendSuccess(res, HTTP_STATUS.OK, 'Class updated successfully', cls);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * DELETE /api/classes/:id  (soft delete)
   */
  deleteClass: async (req, res, next) => {
    try {
      await classService.deleteClass(req.params.id);
      return sendSuccess(res, HTTP_STATUS.OK, 'Class deleted successfully');
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = classController;
