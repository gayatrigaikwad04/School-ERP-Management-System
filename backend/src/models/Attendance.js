/**
 * Attendance Model
 *
 * Business rule: ONE record per student per date (enforced via compound unique index).
 * Status values: Present | Absent
 */

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class ID is required'],
    },
    // Store date as a pure date string (YYYY-MM-DD) to avoid timezone drift
    // when comparing "today's" records across timezones.
    date: {
      type: String,
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Present', 'Absent'],
        message: "Status must be 'Present' or 'Absent'",
      },
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [300, 'Remarks cannot exceed 300 characters'],
      default: '',
    },
    // Denormalised for fast reads
    studentName: {
      type: String,
      trim: true,
      default: '',
    },
    className: {
      type: String,
      trim: true,
      default: '',
    },
    // Soft delete (rare for attendance but consistent with pattern)
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

// Critical: prevents duplicate attendance for same student on same date
attendanceSchema.index(
  { studentId: 1, date: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

attendanceSchema.index({ classId: 1, date: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ studentId: 1, date: -1 }); // History queries

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
