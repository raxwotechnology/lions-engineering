const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    customerCode: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true
    },
    fullName: {
      type: String,
      required: [true, 'Please add full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add email'],
      unique: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Please add phone number']
    },
    companyName: {
      type: String,
      default: ''
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    idProofType: {
      type: String,
      enum: ['NIC', 'Driving License', 'Passport', 'Business Reg'],
      default: 'NIC'
    },
    idProofNumber: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Blacklisted', 'Inactive'],
      default: 'Active'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
