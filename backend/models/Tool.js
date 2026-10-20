const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a tool name'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    pricePerDay: {
      type: Number,
      min: 0,
      default: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    imageUrl: {
      type: String,
      default: ''
    },
    // Supporting additional fields for existing features
    toolCode: {
      type: String,
      trim: true
    },
    brand: {
      type: String,
      default: ''
    },
    modelNumber: {
      type: String,
      default: ''
    },
    serialNumber: {
      type: String,
      default: ''
    },
    dailyRate: {
      type: Number,
      default: function() { return this.pricePerDay; }
    },
    depositAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Available', 'Rented', 'Maintenance', 'Decommissioned'],
      default: 'Available'
    },
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Needs Repair'],
      default: 'Good'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tool', toolSchema);
