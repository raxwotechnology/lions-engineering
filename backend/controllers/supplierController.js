const Supplier = require('../models/Supplier');
const mockData = require('../utils/mockData');

const getSuppliers = async (req, res) => {
  try {
    let suppliers = await Supplier.find().lean();
    if (!suppliers || suppliers.length === 0) {
      suppliers = mockData.suppliers;
    } else {
      suppliers = suppliers.map(s => ({ ...s, id: s._id.toString() }));
    }
    res.status(200).json({ success: true, count: suppliers.length, suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSupplier = async (req, res) => {
  try {
    const newSup = await Supplier.create({
      supplierCode: req.body.supplierCode || `SUP-${Math.floor(100 + Math.random() * 900)}`,
      companyName: req.body.companyName || 'New Industrial Supplier',
      contactPerson: req.body.contactPerson || 'John Doe',
      email: req.body.email || `contact-${Date.now()}@supplier.com`,
      phone: req.body.phone || '+1 555-0000',
      rating: Number(req.body.rating) || 5.0,
      status: req.body.status || 'Active'
    });
    const formatted = { ...newSup.toObject(), id: newSup._id.toString() };
    res.status(201).json({ success: true, supplier: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSuppliers, createSupplier };
