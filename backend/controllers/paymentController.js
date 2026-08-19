const Payment = require('../models/Payment');

// @desc Create payment record
// @route POST /api/payments
const createPayment = async (req, res) => {
  try {
    const {
      rentalId,
      customerName,
      paymentMethod,
      totalAmount,
      paidAmount,
      balanceAmount,
      paymentStatus,
      languagePreference
    } = req.body;

    if (!rentalId || !customerName || totalAmount === undefined || paidAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required fields: rentalId, customerName, totalAmount, paidAmount'
      });
    }

    const payment = await Payment.create({
      paymentCode: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
      rentalId,
      customerName,
      paymentMethod: paymentMethod || 'Cash',
      totalAmount: Number(totalAmount),
      paidAmount: Number(paidAmount),
      balanceAmount: Number(balanceAmount || 0),
      paymentStatus: Number(paidAmount) >= Number(totalAmount) ? 'Paid' : 'Partially Paid',
      languagePreference: languagePreference || 'en'
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all payments
// @route GET /api/payments
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPayment, getPayments };
