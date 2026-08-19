const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6
    },
    role: {
      type: String,
      enum: ['customer', 'owner', 'admin'],
      default: 'customer',
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      trim: true
    },
    companyName: {
      type: String,
      default: ''
    },
    nicOrPassport: {
      type: String,
      default: ''
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      district: { type: String, default: '' },
      postalCode: { type: String, default: '' }
    },
    avatar: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
