const Reservation = require('../models/Reservation');
const Customer = require('../models/Customer');
const Tool = require('../models/Tool');
const mockData = require('../utils/mockData');

const getReservations = async (req, res) => {
  try {
    let reservations = await Reservation.find()
      .populate('customer', 'fullName email')
      .populate('tool', 'name toolCode')
      .lean();

    if (!reservations || reservations.length === 0) {
      reservations = mockData.reservations;
    } else {
      reservations = reservations.map(r => ({
        ...r,
        id: r._id.toString(),
        customerName: r.customer?.fullName || 'Customer',
        toolName: r.tool?.name || 'Tool'
      }));
    }
    res.status(200).json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createReservation = async (req, res) => {
  try {
    const cust = await Customer.findOne();
    const tool = await Tool.findOne();

    const newRes = await Reservation.create({
      reservationCode: `RES-2026-${Math.floor(100 + Math.random() * 900)}`,
      customer: cust ? cust._id : null,
      tool: tool ? tool._id : null,
      startDate: new Date(req.body.startDate || Date.now()),
      endDate: new Date(req.body.endDate || Date.now() + 86400000 * 3),
      totalDays: Number(req.body.totalDays) || 3,
      totalEstimatedCost: Number(req.body.totalEstimatedCost) || 105,
      status: req.body.status || 'Pending'
    });

    const formatted = {
      ...newRes.toObject(),
      id: newRes._id.toString(),
      customerName: req.body.customerName || (cust ? cust.fullName : 'Customer'),
      toolName: req.body.toolName || (tool ? tool.name : 'Tool')
    };

    res.status(201).json({ success: true, reservation: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getReservations, createReservation };
