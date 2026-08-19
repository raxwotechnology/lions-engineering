const Expense = require('../models/Expense');
const mockData = require('../utils/mockData');

const getExpenses = async (req, res) => {
  try {
    let expenses = await Expense.find().lean();
    if (!expenses || expenses.length === 0) {
      expenses = mockData.expenses;
    } else {
      expenses = expenses.map(e => ({ ...e, id: e._id.toString() }));
    }
    res.status(200).json({ success: true, count: expenses.length, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createExpense = async (req, res) => {
  try {
    const newExp = await Expense.create({
      title: req.body.title || 'Tool Maintenance Service',
      category: req.body.category || 'Maintenance & Repairs',
      amount: Number(req.body.amount) || 150,
      expenseDate: new Date(req.body.expenseDate || Date.now()),
      status: req.body.status || 'Paid',
      vendor: req.body.vendor || 'Local Repair Shop'
    });
    const formatted = { ...newExp.toObject(), id: newExp._id.toString() };
    res.status(201).json({ success: true, expense: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getExpenses, createExpense };
