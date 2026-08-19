const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Maintenance & Repairs', 'Tool Acquisition', 'Utilities', 'Salaries', 'Marketing', 'Logistics', 'Other'],
      default: 'Maintenance & Repairs'
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    expenseDate: {
      type: Date,
      default: Date.now
    },
    vendor: {
      type: String,
      default: ''
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Card', 'Check'],
      default: 'Cash'
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Paid'],
      default: 'Paid'
    },
    receiptUrl: String,
    description: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
