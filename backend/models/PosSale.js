const mongoose = require('mongoose');

const posSaleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: { type: String, required: true },
  productCode: { type: String },
  unit: { type: String, default: 'pcs' },
  qty: { type: Number, required: true, min: 1 },
  sellingPrice: { type: Number, required: true },
  total: { type: Number, required: true }
});

const posSaleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
    },
    customerName: {
      type: String,
      default: 'Walk-in Customer'
    },
    customerPhone: {
      type: String,
      default: ''
    },
    items: [posSaleItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    discountType: { type: String, enum: ['fixed', 'percent'], default: 'fixed' },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    changeAmount: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'Bank Transfer', 'Mobile Pay'],
      default: 'Cash'
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partial', 'Pending'],
      default: 'Paid'
    },
    notes: { type: String, default: '' },
    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Auto-generate invoice number
posSaleSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('PosSale').countDocuments();
    const date = new Date();
    const yymmdd = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    this.invoiceNumber = `INV-${yymmdd}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('PosSale', posSaleSchema);
