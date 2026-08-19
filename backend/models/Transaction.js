const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionCode: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      default: null
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    tool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tool',
      required: true
    },
    transactionType: {
      type: String,
      enum: ['Rental Issue', 'Rental Return'],
      default: 'Rental Issue'
    },
    issueDate: {
      type: Date,
      required: true
    },
    expectedReturnDate: {
      type: Date,
      required: true
    },
    actualReturnDate: {
      type: Date,
      default: null
    },
    dailyRate: {
      type: Number,
      required: true
    },
    rentAmount: {
      type: Number,
      required: true
    },
    depositPaid: {
      type: Number,
      default: 0
    },
    lateFee: {
      type: Number,
      default: 0
    },
    damageFee: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid', 'Refunded'],
      default: 'Pending'
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'Bank Transfer', 'Online'],
      default: 'Cash'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
