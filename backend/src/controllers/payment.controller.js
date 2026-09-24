/**
 * Payment Controller
 * Thin HTTP layer — delegates to paymentService.
 */

const paymentService  = require('../services/payment.service');
const { sendSuccess } = require('../utils/apiResponse');
const HTTP_STATUS     = require('../constants/httpStatus');

const paymentController = {
  /**
   * GET /api/payments
   * Query: search, studentId, mode, date, startDate, endDate, status, page, limit
   */
  getPayments: async (req, res, next) => {
    try {
      const result = await paymentService.getPayments(req.query);
      return sendSuccess(
        res,
        HTTP_STATUS.OK,
        'Payments fetched successfully',
        result.payments,
        { total: result.total, page: result.page, limit: result.limit }
      );
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/payments/student/:studentId
   * Full payment history + fee summary for a student.
   */
  getPaymentsByStudent: async (req, res, next) => {
    try {
      const result = await paymentService.getPaymentsByStudent(req.params.studentId);
      return sendSuccess(res, HTTP_STATUS.OK, 'Student payments fetched successfully', result);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/payments/:id
   */
  getPaymentById: async (req, res, next) => {
    try {
      const payment = await paymentService.getPaymentById(req.params.id);
      return sendSuccess(res, HTTP_STATUS.OK, 'Payment fetched successfully', payment);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /api/payments
   * Body: { studentId, amountPaid, paymentDate, paymentMode, refNumber, remarks }
   */
  createPayment: async (req, res, next) => {
    try {
      const result = await paymentService.createPayment(req.body, req.user.id);
      return sendSuccess(
        res,
        HTTP_STATUS.CREATED,
        `Payment of ₹${result.payment.amountPaid.toLocaleString()} recorded successfully. Receipt: ${result.payment.receiptNumber}`,
        result
      );
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = paymentController;
