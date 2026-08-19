import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MetricCard } from '../components/Common/MetricCard';
import { DataTable } from '../components/Common/DataTable';
import { BarChart3, DollarSign, TrendingUp, Download, PieChart, Calendar, Printer, Wrench, MapPin, Phone, Filter } from 'lucide-react';

export const Reports = () => {
  const [report, setReport] = useState(null);
  const [reportType, setReportType] = useState('monthly'); // 'monthly' or 'daily'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [companySettings, setCompanySettings] = useState({
    managerName: 'Amila Perera (Rental Manager)',
    whatsappNumber: '+94771234567',
    directPhone: '0112345678',
    noticeText: 'We deliver tools within 2 hours in Colombo area!'
  });

  useEffect(() => {
    api.getFinancialReport().then(res => setReport(res));
    fetch('/api/settings/support')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.settings) {
          setCompanySettings(data.settings);
        }
      })
      .catch(err => console.warn('Settings error:', err));
  }, []);

  const formatLKR = (val) => `Rs. ${Number(val || 0).toLocaleString('en-LK')}`;

  // Direct Browser Printing (window.print())
  const handlePrint = () => {
    window.print();
  };

  if (!report) return <div className="p-8 text-center text-slate-500 font-bold">Loading Enterprise Financial Analytics...</div>;

  const { summary, monthlyBreakdown } = report;

  // Mock Daily Transactions Generator based on selectedDate
  const dailyTransactions = [
    {
      id: 'TXN-8801',
      time: '09:15 AM',
      customerName: 'Saman Kumara (BuildTech Ltd)',
      itemBilled: 'DeWalt Heavy Duty Hammer Drill (TL-001)',
      qty: 2,
      days: 3,
      dailyRate: 3500,
      subtotal: 21000,
      deposit: 10000,
      totalIncome: 31000
    },
    {
      id: 'TXN-8802',
      time: '11:45 AM',
      customerName: 'Sunil Perera (Lanka Infra)',
      itemBilled: 'Bobcat Heavy Mini Excavator (TL-002)',
      qty: 1,
      days: 2,
      dailyRate: 28000,
      subtotal: 56000,
      deposit: 25000,
      totalIncome: 81000
    },
    {
      id: 'TXN-8803',
      time: '02:30 PM',
      customerName: 'Nimal Jayasinghe',
      itemBilled: 'Bosch Professional Concrete Mixer (TL-004)',
      qty: 1,
      days: 4,
      dailyRate: 4500,
      subtotal: 18000,
      deposit: 10000,
      totalIncome: 28000
    }
  ];

  const totalDailyRevenue = dailyTransactions.reduce((acc, t) => acc + t.totalIncome, 0);
  const totalDailyDeposit = dailyTransactions.reduce((acc, t) => acc + t.deposit, 0);
  const netDailyRentalFee = dailyTransactions.reduce((acc, t) => acc + t.subtotal, 0);

  const monthlyColumns = [
    { header: 'Financial Period', accessor: 'month' },
    { header: 'Rental Revenue (LKR)', render: (row) => <span className="font-bold text-emerald-400">{formatLKR(row.revenue)}</span> },
    { header: 'Operational Expenses (LKR)', render: (row) => <span className="font-bold text-rose-400">{formatLKR(row.expenses)}</span> },
    { header: 'Net Operating Profit (LKR)', render: (row) => <span className="font-bold text-slate-100">{formatLKR(row.profit)}</span> },
    {
      header: 'Profitability Margin',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {((row.profit / row.revenue) * 100).toFixed(1)}%
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100">Financial Reports & Daily Income Summary</h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyze daily cash collections, monthly operating margins, expenses, and printable statements in LKR.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Report Type */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setReportType('monthly')}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                reportType === 'monthly' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
              }`}
            >
              Monthly Statement
            </button>
            <button
              onClick={() => setReportType('daily')}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                reportType === 'daily' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
              }`}
            >
              Daily Income Sheet
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" /> Direct Print Report (window.print)
          </button>
        </div>
      </div>

      {/* Printable Report Header with Custom Company Settings */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-950 space-y-6 print:p-0 print:border-none print:bg-white print:text-slate-900" id="printable-report">
        
        {/* Dynamic Company Branding Header */}
        <div className="flex justify-between items-start border-b border-slate-800 print:border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
                <Wrench className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-black text-xl text-slate-100 print:text-slate-900 tracking-tight">
                  LIONS ENGINEERING & TOOL RENTAL
                </h1>
                <p className="text-xs text-amber-400 print:text-amber-700 font-bold uppercase tracking-wider">
                  {reportType === 'monthly' ? 'Executive Monthly Financial Statement' : `Daily Revenue & Income Audit Sheet (${selectedDate})`}
                </p>
              </div>
            </div>

            {/* Custom Address & Phone saved in Settings */}
            <div className="text-xs text-slate-400 print:text-slate-600 mt-3 space-y-1 font-medium">
              <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-400 print:text-slate-400" /> 145 Industrial Zone Road, Colombo 05, Sri Lanka</p>
              <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-amber-400 print:text-slate-400" /> Hotline: {companySettings.directPhone || '0112345678'} | WhatsApp: {companySettings.whatsappNumber || '+94771234567'}</p>
              <p className="text-[11px] text-slate-500 font-mono">Reg No: PV-901284 | Manager: {companySettings.managerName}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 print:bg-emerald-100 print:text-emerald-800 rounded-full font-bold text-xs border border-amber-500/30">
              CONFIDENTIAL AUDIT
            </span>
            <p className="text-xs font-mono font-bold text-slate-300 print:text-slate-700 mt-2">Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Date Filter Bar for Daily Income Sheet */}
        {reportType === 'daily' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 print:bg-slate-50 p-4 rounded-2xl border border-slate-800 print:border-slate-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200 print:text-slate-900">Select Specific Filter Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-950 print:bg-white text-slate-100 print:text-slate-900 border border-slate-800 print:border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold font-mono focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-400 print:text-slate-600 font-mono font-bold">
              Total Transactions Recorded: {dailyTransactions.length}
            </span>
          </div>
        )}

        {/* KPI Metrics Breakdown */}
        {reportType === 'monthly' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Total Revenue" value={formatLKR(summary.totalRevenue || 1475000)} change="+18.4%" icon={DollarSign} color="emerald" />
            <MetricCard title="Total Expenses" value={formatLKR(summary.totalExpenses || 1070000)} change="-4.2%" icon={PieChart} color="rose" />
            <MetricCard title="Net Profit Margin" value={summary.profitMargin || '27.4%'} change="+3.1%" icon={TrendingUp} color="amber" />
            <MetricCard title="Avg Rental Value" value={formatLKR(summary.averageRentalValue || 737500)} change="2 Bookings" icon={BarChart3} color="purple" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard title="Total Daily Collections" value={formatLKR(totalDailyRevenue)} change="Included Deposits" icon={DollarSign} color="emerald" />
            <MetricCard title="Net Daily Hire Income" value={formatLKR(netDailyRentalFee)} change="Tool Rentals" icon={TrendingUp} color="amber" />
            <MetricCard title="Daily Deposits Collected" value={formatLKR(totalDailyDeposit)} change="Refundable" icon={BarChart3} color="purple" />
          </div>
        )}

        {/* Report Content Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-100 print:text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            {reportType === 'monthly' ? 'Monthly Revenue vs Operating Expenses Breakdown' : `Daily Income Transactions Breakdown for ${selectedDate}`}
          </h3>

          {reportType === 'monthly' ? (
            <DataTable columns={monthlyColumns} data={monthlyBreakdown} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 print:bg-slate-100 text-slate-400 print:text-slate-700 uppercase font-bold text-[10px] border-b border-slate-800 print:border-slate-300">
                    <th className="py-3 px-4">Txn Ref & Time</th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Equipment Item Billed (Name & Code)</th>
                    <th className="py-3 px-4 text-center">Qty / Days</th>
                    <th className="py-3 px-4 text-right">Rental Fee</th>
                    <th className="py-3 px-4 text-right">Deposit</th>
                    <th className="py-3 px-4 text-right">Total Income (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 print:divide-slate-200 text-slate-200 print:text-slate-900 font-medium">
                  {dailyTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400 print:text-amber-700">{t.id} <span className="text-[10px] text-slate-500 block font-normal">{t.time}</span></td>
                      <td className="py-3 px-4 font-bold text-slate-100 print:text-slate-900">{t.customerName}</td>
                      <td className="py-3 px-4 font-semibold text-slate-200 print:text-slate-800">{t.itemBilled}</td>
                      <td className="py-3 px-4 text-center font-mono">{t.qty} Qty • {t.days} Days</td>
                      <td className="py-3 px-4 text-right font-mono">{formatLKR(t.subtotal)}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400 print:text-slate-600">{formatLKR(t.deposit)}</td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-400 print:text-emerald-700">{formatLKR(t.totalIncome)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
