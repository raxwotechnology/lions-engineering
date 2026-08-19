const mockData = require('../utils/mockData');

const getFinancialReport = (req, res) => {
  const totalRevenue = mockData.transactions.reduce((acc, c) => acc + c.totalAmount, 0);
  const totalExpenses = mockData.expenses.reduce((acc, c) => acc + c.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  res.status(200).json({
    success: true,
    reportPeriod: 'August 2026',
    summary: {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) + '%' : '0%',
      totalRentals: mockData.transactions.length,
      averageRentalValue: mockData.transactions.length > 0 ? (totalRevenue / mockData.transactions.length).toFixed(2) : 0
    },
    monthlyBreakdown: [
      { month: 'May 2026', revenue: 4200, expenses: 1100, profit: 3100 },
      { month: 'Jun 2026', revenue: 5800, expenses: 1450, profit: 4350 },
      { month: 'Jul 2026', revenue: 7100, expenses: 1900, profit: 5200 },
      { month: 'Aug 2026', revenue: totalRevenue, expenses: totalExpenses, profit: netProfit }
    ]
  });
};

module.exports = { getFinancialReport };
