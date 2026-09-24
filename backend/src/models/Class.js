/**
 * Class Model
 * Represents a class/section combination (e.g. "Grade 1 – A").
 * Supports soft delete via isDeleted flag.
 */

const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
      maxlength: [50, 'Class name cannot exceed 50 characters'],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      uppercase: true,
      maxlength: [5, 'Section cannot exceed 5 characters'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      match: [/^\d{4}[–\-]\d{2,4}$/, 'Academic year format must be YYYY–YY (e.g. 2026–27)'],
    },
    classTeacherName: {
      type: String,
      trim: true,
      default: '',
    },
    room: {
      type: String,
      trim: true,
      default: '',
    },
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1'],
      max: [200, 'Capacity cannot exceed 200'],
      default: 30,
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
  }
);

// ─────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────

// Compound unique: same class name + section + academic year only once
classSchema.index(
  { className: 1, section: 1, academicYear: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
classSchema.index({ status: 1 });
classSchema.index({ academicYear: 1 });

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
