/**
 * Parent Controller
 * Thin HTTP layer — delegates to parentService.
 */

const parentService   = require('../services/parent.service');
const { sendSuccess } = require('../utils/apiResponse');
const HTTP_STATUS     = require('../constants/httpStatus');

const parentController = {
  /**
   * GET /api/parents
   * Query: search, page, limit
   */
  getParents: async (req, res, next) => {
    try {
      const result = await parentService.getParents(req.query);
      return sendSuccess(
        res,
        HTTP_STATUS.OK,
        'Parents fetched successfully',
        result.parents,
        { total: result.total, page: result.page, limit: result.limit }
      );
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/parents/list
   * Lightweight list for student-enrollment dropdowns.
   */
  getAllParentsList: async (req, res, next) => {
    try {
      const parents = await parentService.getAllParentsList();
      return sendSuccess(res, HTTP_STATUS.OK, 'Parents list fetched successfully', parents);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/parents/:id
   */
  getParentById: async (req, res, next) => {
    try {
      const parent = await parentService.getParentById(req.params.id);
      return sendSuccess(res, HTTP_STATUS.OK, 'Parent fetched successfully', parent);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /api/parents
   */
  createParent: async (req, res, next) => {
    try {
      const parent = await parentService.createParent(req.body);
      return sendSuccess(res, HTTP_STATUS.CREATED, 'Parent created successfully', parent);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * PUT /api/parents/:id
   */
  updateParent: async (req, res, next) => {
    try {
      const parent = await parentService.updateParent(req.params.id, req.body);
      return sendSuccess(res, HTTP_STATUS.OK, 'Parent updated successfully', parent);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * DELETE /api/parents/:id  (soft delete)
   */
  deleteParent: async (req, res, next) => {
    try {
      await parentService.deleteParent(req.params.id);
      return sendSuccess(res, HTTP_STATUS.OK, 'Parent deleted successfully');
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = parentController;
