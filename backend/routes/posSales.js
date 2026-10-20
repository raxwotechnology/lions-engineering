const express = require('express');
const router = express.Router();
const PosSale = require('../models/PosSale');
const Product = require('../models/Product');

// GET all POS sales
router.get('/', async (req, res) => {
  try {
    const { from, to, paymentMethod, paymentStatus } = req.query;
    let query = {};
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(new Date(to).setHours(23, 59, 59));
    }

    const sales = await PosSale.find(query)
      .populate('customer', 'fullName phone email')
      .sort({ createdAt: -1 });
    res.json({ success: true, sales });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single sale
router.get('/:id', async (req, res) => {
  try {
    const sale = await PosSale.findById(req.params.id)
      .populate('customer', 'fullName phone email address');
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, sale });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create a new POS sale & deduct stock
router.post('/', async (req, res) => {
  try {
    const { items, customer, customerName, customerPhone, subtotal, discount, discountType, totalAmount, paidAmount, paymentMethod, paymentStatus, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in cart' });
    }

    // Verify stock availability & deduct
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product ${item.productName} not found` });
      if (product.stock < item.qty) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }
      product.stock -= item.qty;
      await product.save();
    }

    const changeAmount = (paidAmount || 0) - totalAmount;

    const sale = await PosSale.create({
      items,
      customer: customer || null,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      subtotal,
      discount: discount || 0,
      discountType: discountType || 'fixed',
      totalAmount,
      paidAmount: paidAmount || totalAmount,
      changeAmount: changeAmount > 0 ? changeAmount : 0,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: paymentStatus || 'Paid',
      notes: notes || ''
    });

    res.status(201).json({ success: true, sale });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE sale (void)
router.delete('/:id', async (req, res) => {
  try {
    const sale = await PosSale.findById(req.params.id);
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });

    // Restore stock
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
    }

    await sale.deleteOne();
    res.json({ success: true, message: 'Sale voided and stock restored' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET sales summary stats
router.get('/stats/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = await PosSale.aggregate([
      { $match: { createdAt: { $gte: today }, paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);
    const totalSales = await PosSale.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);
    res.json({
      success: true,
      todayRevenue: todaySales[0]?.total || 0,
      todayCount: todaySales[0]?.count || 0,
      totalRevenue: totalSales[0]?.total || 0,
      totalCount: totalSales[0]?.count || 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
