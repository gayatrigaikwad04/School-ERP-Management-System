/**
 * Fee Controller
 * Thin HTTP layer — delegates to feeService.
 */

const feeService     = require('../services/fee.service');
const { sendSuccess } = require('../utils/apiResponse');
const HTTP_STATUS    = require('../constants/httpStatus');

const feeController = {
  /**
   * GET /api/fees
   * Query: academicYear, status, classId
   */
  getFeeStructures: async (req, res, next) => {
    try {
      const fees = await feeService.getFeeStructures(req.query);
      return sendSuccess(res, HTTP_STATUS.OK, 'Fee structures fetched successfully', fees);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/fees/pending
   * Query: search, classId, page, limit, onlyPending
   */
  getPendingFees: async (req, res, next) => {
    try {
      const result = await feeService.getPendingFees(req.query);
      return sendSuccess(
        res,
        HTTP_STATUS.OK,
        'Pending fees fetched successfully',
        result,
        {
          totalPendingStudents: result.totalPendingStudents,
          totalPendingAmount:   result.totalPendingAmount,
          page:  result.page,
          limit: result.limit,
        }
      );
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/fees/:id
   */
  getFeeById: async (req, res, next) => {
    try {
      const fee = await feeService.getFeeById(req.params.id);
      return sendSuccess(res, HTTP_STATUS.OK, 'Fee structure fetched successfully', fee);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /api/fees
   */
  createFeeStructure: async (req, res, next) => {
    try {
      const fee = await feeService.createFeeStructure(req.body);
      return sendSuccess(res, HTTP_STATUS.CREATED, 'Fee structure created successfully', fee);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * PUT /api/fees/:id
   */
  updateFeeStructure: async (req, res, next) => {
    try {
      const fee = await feeService.updateFeeStructure(req.params.id, req.body);
      return sendSuccess(res, HTTP_STATUS.OK, 'Fee structure updated successfully', fee);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * DELETE /api/fees/:id  (soft delete)
   */
  deleteFeeStructure: async (req, res, next) => {
    try {
      await feeService.deleteFeeStructure(req.params.id);
      return sendSuccess(res, HTTP_STATUS.OK, 'Fee structure deleted successfully');
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = feeController;
