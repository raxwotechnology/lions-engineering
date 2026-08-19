const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    reservationCode: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true
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
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    totalDays: {
      type: Number,
      default: 1
    },
    totalEstimatedCost: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Fulfilled', 'Cancelled'],
      default: 'Pending'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
