const Tool = require('../models/Tool');
const Customer = require('../models/Customer');
const Reservation = require('../models/Reservation');
const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');
const mockData = require('../utils/mockData');

// @desc Get role-based dashboard overview & metrics
// @route GET /api/dashboard
const getDashboardOverview = async (req, res) => {
  try {
    const { role } = req.query;

    const totalTools = await Tool.countDocuments();
    const availableTools = await Tool.countDocuments({ status: 'Available' });
    const rentedTools = await Tool.countDocuments({ status: 'Rented' });
    const maintenanceTools = await Tool.countDocuments({ status: 'Maintenance' });
    const activeCustomers = await Customer.countDocuments({ status: 'Active' });
    const pendingReservations = await Reservation.countDocuments({ status: 'Pending' });

    const transactions = await Transaction.find().lean();
    const expenses = await Expense.find().lean();

    let totalRevenue = transactions.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    let totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // Fallback if db empty
    if (totalTools === 0) {
      return res.status(200).json({
        success: true,
        role: role || 'Admin',
        metrics: {
          totalTools: mockData.tools.length,
          availableTools: mockData.tools.filter(t => t.status === 'Available').length,
          rentedTools: mockData.tools.filter(t => t.status === 'Rented').length,
          maintenanceTools: mockData.tools.filter(t => t.status === 'Maintenance').length,
          activeCustomers: mockData.customers.length,
          pendingReservations: mockData.reservations.filter(r => r.status === 'Pending').length,
          totalRevenue: 1475,
          totalExpenses: 1070,
          netProfit: 405
        },
        recentReservations: mockData.reservations.slice(0, 5),
        recentTransactions: mockData.transactions.slice(0, 5)
      });
    }

    res.status(200).json({
      success: true,
      role: role || 'Admin',
      metrics: {
        totalTools,
        availableTools,
        rentedTools,
        maintenanceTools,
        activeCustomers,
        pendingReservations,
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses
      },
      recentReservations: (await Reservation.find().limit(5).populate('customer tool').lean()).map(r => ({ ...r, id: r._id.toString(), customerName: r.customer?.fullName, toolName: r.tool?.name })),
      recentTransactions: (await Transaction.find().limit(5).populate('customer tool').lean()).map(t => ({ ...t, id: t._id.toString(), customerName: t.customer?.fullName, toolName: t.tool?.name }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardOverview };
