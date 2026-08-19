const Quotation = require('../models/Quotation');
const mockData = require('../utils/mockData');

const getQuotations = async (req, res) => {
  try {
    let quotations = await Quotation.find().lean();
    if (!quotations || quotations.length === 0) {
      quotations = mockData.quotations;
    } else {
      quotations = quotations.map(q => ({ ...q, id: q._id.toString() }));
    }
    res.status(200).json({ success: true, count: quotations.length, quotations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createQuotation = async (req, res) => {
  try {
    const newQt = await Quotation.create({
      quotationNumber: `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerName: req.body.customerName || 'Prospect Client',
      totalAmount: Number(req.body.totalAmount) || 500,
      validUntil: new Date(req.body.validUntil || Date.now() + 86400000 * 14),
      status: req.body.status || 'Sent'
    });
    const formatted = { ...newQt.toObject(), id: newQt._id.toString() };
    res.status(201).json({ success: true, quotation: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getQuotations, createQuotation };
