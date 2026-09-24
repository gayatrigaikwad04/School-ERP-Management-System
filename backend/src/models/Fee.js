/**
 * Fee Model
 * Represents the fee structure defined per class per academic year.
 *
 * Business rule: Only ONE active fee structure per classId + academicYear.
 * term1Fee + term2Fee should equal totalAnnualFee (enforced in service).
 */

const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    // Denormalised for fast reads / reports
    className: {
      type: String,
      trim: true,
      default: '',
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      match: [/^\d{4}[–\-]\d{2,4}$/, 'Academic year format must be YYYY–YY (e.g. 2026–27)'],
    },
    totalAnnualFee: {
      type: Number,
      required: [true, 'Total annual fee is required'],
      min: [0, 'Total annual fee cannot be negative'],
    },
    term1Fee: {
      type: Number,
      required: [true, 'Term 1 fee is required'],
      min: [0, 'Term 1 fee cannot be negative'],
    },
    term2Fee: {
      type: Number,
      required: [true, 'Term 2 fee is required'],
      min: [0, 'Term 2 fee cannot be negative'],
    },
    labTechFee: {
      type: Number,
      min: [0, 'Lab/tech fee cannot be negative'],
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Inactive'],
        message: 'Status must be Active or Inactive',
      },
      default: 'Active',
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
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────
// Virtuals
// ─────────────────────────────────────────────

feeSchema.virtual('termBreakdown').get(function () {
  return {
    term1: this.term1Fee,
    term2: this.term2Fee,
    labTech: this.labTechFee,
    total: this.totalAnnualFee,
  };
});

// ─────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────

// Unique fee structure per class per year (only for non-deleted)
feeSchema.index(
  { classId: 1, academicYear: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
feeSchema.index({ status: 1 });
feeSchema.index({ academicYear: 1 });

const Fee = mongoose.model('Fee', feeSchema);

module.exports = Fee;
