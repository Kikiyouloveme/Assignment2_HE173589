const mongoose = require('mongoose');

const MEMBERSHIP_TYPES = ['Student', 'Teacher', 'Guest'];

const memberSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, 'fullName is required'], trim: true },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'email is invalid'],
    },
    phone: { type: String, required: [true, 'phone is required'], trim: true },
    membershipType: {
      type: String,
      enum: {
        values: MEMBERSHIP_TYPES,
        message: `membershipType must be one of: ${MEMBERSHIP_TYPES.join(', ')}`,
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Member', memberSchema, 'members');
