const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      default: 'General'
    },
    description: {
      type: String,
      default: ''
    },
    unit: {
      type: String,
      enum: ['pcs', 'kg', 'g', 'L', 'm', 'ft', 'box', 'bag', 'roll', 'set', 'pair'],
      default: 'pcs'
    },
    buyingPrice: {
      type: Number,
      required: [true, 'Please add buying price'],
      min: 0,
      default: 0
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Please add selling price'],
      min: 0,
      default: 0
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    minStockAlert: {
      type: Number,
      default: 10
    },
    supplier: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Discontinued'],
      default: 'Active'
    },
    barcode: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Auto-generate product code before saving
productSchema.pre('save', async function (next) {
  if (!this.productCode) {
    const count = await mongoose.model('Product').countDocuments();
    this.productCode = `PRD-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
