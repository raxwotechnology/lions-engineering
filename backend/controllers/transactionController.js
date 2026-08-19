const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const Tool = require('../models/Tool');
const mockData = require('../utils/mockData');

const getTransactions = async (req, res) => {
  try {
    let transactions = await Transaction.find()
      .populate('customer', 'fullName email')
      .populate('tool', 'name toolCode')
      .lean();

    if (!transactions || transactions.length === 0) {
      transactions = mockData.transactions;
    } else {
      transactions = transactions.map(t => ({
        ...t,
        id: t._id.toString(),
        customerName: t.customer?.fullName || 'Customer',
        toolName: t.tool?.name || 'Tool'
      }));
    }
    res.status(200).json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTransaction = async (req, res) => {
  try {
    const cust = await Customer.findOne();
    const tool = await Tool.findOne();

    const newTx = await Transaction.create({
      transactionCode: `TX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: cust ? cust._id : null,
      tool: tool ? tool._id : null,
      transactionType: req.body.transactionType || 'Rental Issue',
      issueDate: new Date(req.body.issueDate || Date.now()),
      expectedReturnDate: new Date(req.body.expectedReturnDate || Date.now() + 86400000 * 3),
      dailyRate: Number(req.body.dailyRate) || 35,
      rentAmount: Number(req.body.totalAmount) || 140,
      depositPaid: Number(req.body.depositPaid) || 100,
      totalAmount: Number(req.body.totalAmount) || 140,
      paymentStatus: req.body.paymentStatus || 'Paid',
      paymentMethod: req.body.paymentMethod || 'Cash'
    });

    const formatted = {
      ...newTx.toObject(),
      id: newTx._id.toString(),
      customerName: req.body.customerName || (cust ? cust.fullName : 'Customer'),
      toolName: req.body.toolName || (tool ? tool.name : 'Tool')
    };

    res.status(201).json({ success: true, transaction: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTransactions, createTransaction };
