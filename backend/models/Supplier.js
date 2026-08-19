const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    supplierCode: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    contactPerson: String,
    email: {
      type: String,
      lowercase: true
    },
    phone: String,
    categorySupplied: [String],
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);
