/**
 * User Model
 * Represents admin/staff accounts that can log in to the portal.
 * Passwords are hashed with bcryptjs before save.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never returned in queries unless explicitly selected
    },
    role: {
      type: String,
      enum: {
        values: ['Admin', 'Staff'],
        message: 'Role must be Admin or Staff',
      },
      default: 'Admin',
    },
    title: {
      type: String,
      trim: true,
      default: 'Administrator',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
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
    timestamps: true, // createdAt, updatedAt
  }
);

// ─────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });

// ─────────────────────────────────────────────
// Pre-save hook: hash password only when modified
// ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

// ─────────────────────────────────────────────
// Instance method: compare plain password with hash
// ─────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─────────────────────────────────────────────
// Instance method: safe public profile (no password)
// ─────────────────────────────────────────────
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    title: this.title,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
