const Category = require('../models/Category');
const mockData = require('../utils/mockData');

const getCategories = async (req, res) => {
  try {
    let categories = await Category.find().lean();
    if (!categories || categories.length === 0) {
      categories = mockData.categories;
    } else {
      categories = categories.map(c => ({ ...c, id: c._id.toString() }));
    }
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    // Check permission
    if (req.user && req.user.role === 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Admins, Managers, or Owners can create categories.'
      });
    }

    const { name, code, description, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a category name' });
    }

    const categoryCode = (code || name.substring(0, 3)).toUpperCase();

    const newCat = await Category.create({
      code: categoryCode,
      name,
      description: description || '',
      icon: icon || 'Grid',
      status: 'Active'
    });

    const formatted = { ...newCat.toObject(), id: newCat._id.toString() };
    res.status(201).json({ success: true, message: 'Category created successfully', category: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCategories, createCategory };
