/**
 * Parent Model
 * Represents a parent/guardian linked to one or more students.
 * parentId is a human-readable sequential code (PAR-YYYY-NNN).
 */

const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema(
  {
    parentId: {
      type: String,
      required: [true, 'Parent ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Parent name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [
        /^(\+91[\s\-]?)?[6-9]\d{9}$|^\+?[1-9]\d{7,14}$/,
        'Please enter a valid phone number',
      ],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    occupation: {
      type: String,
      trim: true,
      default: '',
    },
    // Virtual reference — actual foreign key lives on Student
    // Stored here for fast lookups / reverse relationship display
    studentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
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
parentSchema.index({ email: 1 }, { unique: true });
parentSchema.index({ parentId: 1 }, { unique: true });
parentSchema.index({ phone: 1 });
parentSchema.index({ name: 'text' }); // Full-text search

const Parent = mongoose.model('Parent', parentSchema);

module.exports = Parent;
