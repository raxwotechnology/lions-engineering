const Rental = require('../models/Rental');
const Tool = require('../models/Tool');
const User = require('../models/User');

// @desc Create a rental request
// @route POST /api/rentals
const createRental = async (req, res) => {
  try {
    const { tool, startDate, endDate, totalPrice, paymentStatus } = req.body;

    if (!tool || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Please provide tool, startDate, and endDate' });
    }

    // Check tool existence and availability
    const toolObj = await Tool.findById(tool);
    if (!toolObj) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    if (!toolObj.isAvailable) {
      return res.status(400).json({ success: false, message: 'Tool is currently not available for rental' });
    }

    // Calculate total price if not provided
    let calculatedPrice = totalPrice;
    if (!calculatedPrice) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      const rate = toolObj.pricePerDay || toolObj.dailyRate || 30;
      calculatedPrice = days * rate;
    }

    const userId = req.user ? req.user._id : (req.body.user || (await User.findOne())._id);

    const rental = await Rental.create({
      user: userId,
      tool: toolObj._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalPrice: Number(calculatedPrice),
      paymentStatus: paymentStatus ? paymentStatus.toLowerCase() : 'pending',
      rentalStatus: 'requested'
    });

    const populated = await Rental.findById(rental._id)
      .populate('user', 'name email phone')
      .populate({
        path: 'tool',
        populate: { path: 'owner', select: 'name email phone' }
      })
      .lean();

    res.status(201).json({
      success: true,
      message: 'Rental request created successfully',
      rental: {
        ...populated,
        id: populated._id.toString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all rentals (with role-based filtering)
// @route GET /api/rentals
const getRentals = async (req, res) => {
  try {
    const filter = {};

    // Filter by user if requested or if customer role
    if (req.query.user) {
      filter.user = req.query.user;
    } else if (req.user && req.user.role === 'customer') {
      filter.user = req.user._id;
    }

    // Filter by tool if requested
    if (req.query.tool) {
      filter.tool = req.query.tool;
    }

    // Filter by rentalStatus if requested
    if (req.query.status) {
      filter.rentalStatus = req.query.status.toLowerCase();
    }

    const rentals = await Rental.find(filter)
      .populate('user', 'name email phone')
      .populate({
        path: 'tool',
        populate: { path: 'owner', select: 'name email phone' }
      })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = rentals.map(r => ({
      ...r,
      id: r._id.toString()
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      rentals: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single rental
// @route GET /api/rentals/:id
const getRentalById = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate({
        path: 'tool',
        populate: { path: 'owner', select: 'name email phone' }
      })
      .lean();

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    res.status(200).json({
      success: true,
      rental: {
        ...rental,
        id: rental._id.toString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Owner approve / reject / update rental request status
// @route PUT /api/rentals/:id/status
const updateRentalStatus = async (req, res) => {
  try {
    const { rentalStatus, paymentStatus } = req.body;

    if (!rentalStatus) {
      return res.status(400).json({ success: false, message: 'Please provide rentalStatus (approved, rejected, returned)' });
    }

    const normalizedStatus = rentalStatus.toLowerCase();
    if (!['requested', 'approved', 'rejected', 'returned'].includes(normalizedStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid rentalStatus value. Allowed: requested, approved, rejected, returned' });
    }

    const rental = await Rental.findById(req.params.id).populate('tool');
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental request not found' });
    }

    // Verify owner/admin rights if authenticated user
    if (req.user && req.user.role !== 'admin' && req.user.role !== 'Admin') {
      const toolOwnerId = rental.tool?.owner ? rental.tool.owner.toString() : null;
      if (toolOwnerId && toolOwnerId !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Only the tool owner or admin can update rental status' });
      }
    }

    rental.rentalStatus = normalizedStatus;
    if (paymentStatus) {
      rental.paymentStatus = paymentStatus.toLowerCase();
    }

    await rental.save();

    // Dynamically update tool availability based on rentalStatus
    if (rental.tool) {
      if (normalizedStatus === 'approved') {
        await Tool.findByIdAndUpdate(rental.tool._id, { isAvailable: false, status: 'Rented' });
      } else if (normalizedStatus === 'returned' || normalizedStatus === 'rejected') {
        await Tool.findByIdAndUpdate(rental.tool._id, { isAvailable: true, status: 'Available' });
      }
    }

    const updatedRental = await Rental.findById(rental._id)
      .populate('user', 'name email phone')
      .populate({
        path: 'tool',
        populate: { path: 'owner', select: 'name email phone' }
      })
      .lean();

    res.status(200).json({
      success: true,
      message: `Rental status updated to ${normalizedStatus}`,
      rental: {
        ...updatedRental,
        id: updatedRental._id.toString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRental, getRentals, getRentalById, updateRentalStatus };
