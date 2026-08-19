const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentCode: {
      type: String,
      unique: true,
      default: () => `PAY-${Math.floor(10000 + Math.random() * 90000)}`
    },
    rentalId: {
      type: String,
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'Bank Transfer'],
      default: 'Cash'
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paidAmount: {
      type: Number,
      required: true
    },
    balanceAmount: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partially Paid'],
      default: 'Paid'
    },
    languagePreference: {
      type: String,
      enum: ['en', 'si'],
      default: 'en'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
