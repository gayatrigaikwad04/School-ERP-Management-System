/**
 * Payment Model
 * Records every fee payment transaction.
 *
 * Business rules (enforced in service):
 *  - amountPaid must be > 0
 *  - amountPaid cannot exceed student's pending fee (no overpayment)
 *  - receiptNumber is auto-generated: REC-YYYY-NNNN
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: [true, 'Receipt number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    // Student reference
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    // Denormalised for reports / list views without populate
    studentName: {
      type: String,
      trim: true,
      default: '',
    },
    studentCode: {
      type: String,   // human-readable studentId e.g. OA-2026-0491
      trim: true,
      default: '',
    },
    className: {
      type: String,
      trim: true,
      default: '',
    },
    amountPaid: {
      type: Number,
      required: [true, 'Amount paid is required'],
      min: [1, 'Payment amount must be greater than zero'],
    },
    paymentDate: {
      type: String,   // Stored as YYYY-MM-DD string (consistent with Attendance)
      required: [true, 'Payment date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Payment date must be in YYYY-MM-DD format'],
    },
    paymentMode: {
      type: String,
      required: [true, 'Payment mode is required'],
      enum: {
        values: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card', 'Other'],
        message: 'Invalid payment mode',
      },
      default: 'Cash',
    },
    refNumber: {
      type: String,
      trim: true,
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['Verified', 'Pending', 'Cancelled'],
        message: 'Status must be Verified, Pending, or Cancelled',
      },
      default: 'Verified',
    },
    // Snapshot of fee state at time of payment (for audit)
    feeSnapshotAtPayment: {
      totalFee:    { type: Number, default: 0 },
      paidBefore:  { type: Number, default: 0 },
      pendingAfter:{ type: Number, default: 0 },
    },
    // Recorded by (user who entered the payment)
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────
paymentSchema.index({ receiptNumber: 1 }, { unique: true });
paymentSchema.index({ studentId: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ paymentMode: 1 });
paymentSchema.index({ status: 1 });
// Compound for student payment history queries
paymentSchema.index({ studentId: 1, paymentDate: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
