const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc Update logged-in user profile & password
// @route PUT /api/users/profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, fullName, phone, companyName, nicOrPassport, address, currentPassword, newPassword } = req.body;

    const userFullName = fullName || name;
    if (userFullName) user.name = userFullName;
    if (phone) user.phone = phone;
    if (companyName !== undefined) user.companyName = companyName;
    if (nicOrPassport !== undefined) user.nicOrPassport = nicOrPassport;

    if (address) {
      const streetVal = address.streetAddress || address.street || user.address?.street || '';
      user.address = {
        street: streetVal,
        city: address.city || user.address?.city || '',
        district: address.district || user.address?.district || '',
        postalCode: address.postalCode || user.address?.postalCode || ''
      };
    }

    // Password Update Logic
    if (newPassword) {
      if (currentPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Current password does not match' });
        }
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile details updated successfully!',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        fullName: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        companyName: updatedUser.companyName,
        nicOrPassport: updatedUser.nicOrPassport,
        address: updatedUser.address
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all customer records with delivery addresses
// @route GET /api/users/customers
const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: { $in: ['customer', 'Customer'] } })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = customers.map(c => ({
      ...c,
      id: c._id.toString(),
      fullName: c.name,
      customerCode: `CUST-${(c._id.toString()).slice(-4).toUpperCase()}`
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      customers: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single customer by ID
// @route GET /api/users/customer/:id
const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password').lean();
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(200).json({
      success: true,
      customer: {
        ...customer,
        id: customer._id.toString(),
        fullName: customer.name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { updateUserProfile, getCustomers, getCustomerById };
