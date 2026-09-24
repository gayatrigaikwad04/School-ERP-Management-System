/**
 * Payment Routes
 *
 * GET    /api/payments                        – paginated list with filters
 * GET    /api/payments/student/:studentId     – all payments for a student
 * GET    /api/payments/:id                    – single payment detail
 * POST   /api/payments                        – record a new payment
 *
 * Payments are immutable once recorded (no PUT/DELETE — use AuditLog for corrections).
 * All routes require a valid JWT.
 */

const { Router } = require('express');
const paymentController = require('../controllers/payment.controller');
const {
  createPaymentValidator,
  idParamValidator,
  studentIdParamValidator,
  listPaymentValidator,
} = require('../validators/payment.validator');
const { protect } = require('../middleware/authMiddleware');

const router = Router();

router.use(protect);

// Static sub-routes BEFORE /:id to avoid capture
router.get('/student/:studentId', studentIdParamValidator, paymentController.getPaymentsByStudent);

router.get('/',     listPaymentValidator,   paymentController.getPayments);
router.get('/:id',  idParamValidator,       paymentController.getPaymentById);
router.post('/',    createPaymentValidator, paymentController.createPayment);

module.exports = router;
