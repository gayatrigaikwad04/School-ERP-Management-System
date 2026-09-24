/**
 * Payment Service
 * Business logic for payment recording.
 *
 * CRITICAL BUSINESS RULES:
 *  1. amountPaid must be > 0.
 *  2. amountPaid cannot exceed student's pending fee (NO OVERPAYMENT).
 *  3. Auto-generate receiptNumber: REC-YYYY-NNNN.
 *  4. After successful payment, update student.paidAmount.
 *  5. Payment date cannot be in the future.
 */

const paymentRepo = require('../repositories/payment.repository');
const studentRepo = require('../repositories/student.repository');
const AppError    = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

// ─────────────────────────────────────────────
// Helper: generate next receipt number REC-YYYY-NNNN
// ─────────────────────────────────────────────
const generateReceiptNumber = async () => {
  const year   = new Date().getFullYear();
  const prefix = `REC-${year}-`;

  const last = await paymentRepo.findLastReceiptNumber();
  let nextNum = 1;

  if (last && last.receiptNumber && last.receiptNumber.startsWith(prefix)) {
    const parts  = last.receiptNumber.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(lastNum)) nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`;
};

// ─────────────────────────────────────────────
// Helper: today's date string YYYY-MM-DD
// ─────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0];

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

const paymentService = {
  /**
   * Paginated + filtered payment list.
   */
  getPayments: async (queryParams) => {
    const filters = {
      search:    queryParams.search    || '',
      studentId: queryParams.studentId || '',
      mode:      queryParams.mode      || '',
      date:      queryParams.date      || '',
      startDate: queryParams.startDate || '',
      endDate:   queryParams.endDate   || '',
      status:    queryParams.status    || '',
    };
    const options = { page: queryParams.page || 1, limit: queryParams.limit || 20 };
    return paymentRepo.findAll(filters, options);
  },

  /**
   * Payment detail by id.
   */
  getPaymentById: async (id) => {
    const payment = await paymentRepo.findById(id);
    if (!payment) throw new AppError('Payment record not found.', HTTP_STATUS.NOT_FOUND);
    return payment;
  },

  /**
   * All payments for a specific student.
   */
  getPaymentsByStudent: async (studentId) => {
    const student = await studentRepo.findById(studentId);
    if (!student) throw new AppError('Student not found.', HTTP_STATUS.NOT_FOUND);

    const payments = await paymentRepo.findByStudent(studentId);
    const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);

    return {
      student: {
        id:        student._id,
        studentId: student.studentId,
        name:      `${student.firstName} ${student.lastName}`,
        className: student.className,
        totalFee:  student.totalFee,
        paidAmount:student.paidAmount,
        pending:   Math.max(0, student.totalFee - student.paidAmount),
      },
      payments,
      totalPaid,
    };
  },

  /**
   * Record a new payment.
   *
   * @param {object} data  - { studentId, amountPaid, paymentDate, paymentMode, refNumber, remarks }
   * @param {string} userId - From req.user.id (logged-in admin)
   */
  createPayment: async (data, userId) => {
    // 1. Fetch student
    const student = await studentRepo.findById(data.studentId);
    if (!student) throw new AppError('Student not found.', HTTP_STATUS.NOT_FOUND);

    const amountToPay = Number(data.amountPaid);

    // 2. Amount must be > 0
    if (!amountToPay || amountToPay <= 0) {
      throw new AppError('Payment amount must be greater than zero.', HTTP_STATUS.BAD_REQUEST);
    }

    // 3. Payment date cannot be in the future
    const paymentDate = data.paymentDate || todayStr();
    if (paymentDate > todayStr()) {
      throw new AppError('Payment date cannot be in the future.', HTTP_STATUS.BAD_REQUEST);
    }

    // 4. CRITICAL: Prevent overpayment
    const currentPaid = Number(student.paidAmount || 0);
    const totalFee    = Number(student.totalFee   || 0);
    const pending     = Math.max(0, totalFee - currentPaid);

    if (amountToPay > pending) {
      throw new AppError(
        `Overpayment rejected. Payment amount (₹${amountToPay.toLocaleString()}) exceeds pending fee (₹${pending.toLocaleString()}).`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (pending === 0) {
      throw new AppError(
        'This student has no pending fees. All fees are already cleared.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 5. Generate receipt number
    const receiptNumber = await generateReceiptNumber();

    // 6. Create payment record
    const payment = await paymentRepo.create({
      receiptNumber,
      studentId:   student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      studentCode: student.studentId,
      className:   student.className,
      amountPaid:  amountToPay,
      paymentDate,
      paymentMode: data.paymentMode || 'Cash',
      refNumber:   data.refNumber   || '',
      remarks:     data.remarks     || 'Fee payment received',
      status:      'Verified',
      recordedBy:  userId || null,
      feeSnapshotAtPayment: {
        totalFee,
        paidBefore:   currentPaid,
        pendingAfter: Math.max(0, pending - amountToPay),
      },
    });

    // 7. Update student's paidAmount
    await studentRepo.updatePaidAmount(student._id, currentPaid + amountToPay);

    return {
      payment,
      student: {
        id:          student._id,
        studentId:   student.studentId,
        name:        `${student.firstName} ${student.lastName}`,
        totalFee,
        newPaidAmount: currentPaid + amountToPay,
        newPending:  Math.max(0, pending - amountToPay),
      },
    };
  },
};

module.exports = paymentService;
