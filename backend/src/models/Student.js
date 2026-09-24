/**
 * Student Model
 * Central entity of SchoolERP.
 * References Parent and Class via ObjectId.
 * studentId is human-readable: OA-YYYY-NNNN.
 * Supports soft delete, fee tracking, and full demographic data.
 */

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [1, 'First name is required'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [1, 'Last name is required'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: 'Gender must be Male, Female, or Other',
      },
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
        message: 'Invalid blood group',
      },
      default: '',
    },
    // Class reference
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    // Denormalised class display name for fast reads (e.g. "Grade 1 A")
    className: {
      type: String,
      trim: true,
      default: '',
    },
    rollNo: {
      type: String,
      trim: true,
      default: '',
    },
    // Parent reference
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: [true, 'Parent is required'],
    },
    // Denormalised parent display fields for fast reads
    parentName: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    admissionDate: {
      type: Date,
      required: [true, 'Admission date is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Inactive'],
        message: 'Status must be Active or Inactive',
      },
      default: 'Active',
    },
    // Fee tracking — denormalised for dashboard performance
    totalFee: {
      type: Number,
      min: [0, 'Total fee cannot be negative'],
      default: 0,
    },
    paidAmount: {
      type: Number,
      min: [0, 'Paid amount cannot be negative'],
      default: 0,
    },
    avatar: {
      type: String,
      trim: true,
      default: '',
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

studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

studentSchema.virtual('pendingFee').get(function () {
  return Math.max(0, (this.totalFee || 0) - (this.paidAmount || 0));
});

// ─────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────
studentSchema.index({ studentId: 1 }, { unique: true });
studentSchema.index({ classId: 1 });
studentSchema.index({ parentId: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ admissionDate: -1 });
// Compound for common dashboard queries
studentSchema.index({ classId: 1, status: 1 });
// Text search
studentSchema.index({ firstName: 'text', lastName: 'text', studentId: 'text' });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
