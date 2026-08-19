const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  tool: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool'
  },
  toolName: String,
  dailyRate: Number,
  days: Number,
  quantity: Number,
  amount: Number
});

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      unique: true,
      uppercase: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    customerName: String,
    customerEmail: String,
    items: [quotationItemSchema],
    subtotal: Number,
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    validUntil: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Approved', 'Rejected', 'Converted'],
      default: 'Draft'
    },
    notes: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quotation', quotationSchema);
