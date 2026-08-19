const Customer = require('../models/Customer');
const mockData = require('../utils/mockData');

const getCustomers = async (req, res) => {
  try {
    let customers = await Customer.find().lean();
    if (!customers || customers.length === 0) {
      customers = mockData.customers;
    } else {
      customers = customers.map(c => ({ ...c, id: c._id.toString() }));
    }
    res.status(200).json({ success: true, count: customers.length, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCustomer = async (req, res) => {
  try {
    const newCust = await Customer.create({
      customerCode: req.body.customerCode || `CUST-${Math.floor(100 + Math.random() * 900)}`,
      fullName: req.body.fullName || 'New Renter Customer',
      email: req.body.email || `cust-${Date.now()}@example.com`,
      phone: req.body.phone || '+1 555-0100',
      companyName: req.body.companyName || '',
      idProofType: req.body.idProofType || 'NIC',
      idProofNumber: req.body.idProofNumber || 'ID-12345',
      status: req.body.status || 'Active'
    });
    const formatted = { ...newCust.toObject(), id: newCust._id.toString() };
    res.status(201).json({ success: true, customer: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCustomers, createCustomer };
