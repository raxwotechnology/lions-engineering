const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rental must specify a user']
    },
    tool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tool',
      required: [true, 'Rental must specify a tool']
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date']
    },
    endDate: {
      type: Date,
      required: [true, 'Please add an end date']
    },
    totalPrice: {
      type: Number,
      required: [true, 'Please add total price'],
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
      lowercase: true
    },
    rentalStatus: {
      type: String,
      enum: ['requested', 'approved', 'returned'],
      default: 'requested',
      lowercase: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rental', rentalSchema);
