import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/Common/StatusBadge';
import { SupportWidget } from '../components/Common/SupportWidget';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Wrench,
  DollarSign,
  CalendarCheck,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowRight,
  FileText,
  CheckCircle,
  XCircle,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  CreditCard,
  MessageCircle,
  HelpCircle,
  Search,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [recentRentals, setRecentRentals] = useState([]);
  const [loadingRentals, setLoadingRentals] = useState(true);

  const isCustomer = (user?.role || '').toLowerCase() === 'customer';
  const userName = user?.name || 'Vimaya Madawaththa';

  useEffect(() => {
    api.getDashboard(user?.role).then((res) => setData(res));
    fetchRecentRentals();
  }, [user?.role]);

  const fetchRecentRentals = async () => {
    setLoadingRentals(true);
    try {
      const res = await fetch('/api/rentals', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      const result = await res.json();
      if (res.ok && result.rentals) {
        setRecentRentals(result.rentals);
      }
    } catch (err) {
      console.warn('Rentals fetch error:', err);
    } finally {
      setLoadingRentals(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/rentals/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ rentalStatus: newStatus.toLowerCase() })
      });
      if (res.ok) {
        fetchRecentRentals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatLKR = (val) => `Rs. ${Number(val || 0).toLocaleString('en-LK')}`;

  // Financial Growth Area Chart Data (6 Months)
  const revenueChartData = [
    { month: 'Mar', revenue: 650000, expenses: 180000 },
    { month: 'Apr', revenue: 820000, expenses: 220000 },
    { month: 'May', revenue: 950000, expenses: 290000 },
    { month: 'Jun', revenue: 1100000, expenses: 310000 },
    { month: 'Jul', revenue: 1350000, expenses: 380000 },
    { month: 'Aug', revenue: 1475000, expenses: 410000 },
  ];

  // Tool Utilization Category Doughnut Data
  const categoryUtilizationData = [
    { name: 'Power Tools', value: 45, color: '#F59E0B' },
    { name: 'Heavy Machinery', value: 25, color: '#3B82F6' },
    { name: 'Concrete & Masonry', value: 20, color: '#10B981' },
    { name: 'Scaffolding & Safety', value: 10, color: '#8B5CF6' },
  ];

  const activeRentalsCount = recentRentals.filter(r => (r.rentalStatus || r.status || '').toLowerCase() === 'approved' || (r.rentalStatus || r.status || '').toLowerCase() === 'active').length;

  return (
    <div className="space-y-6 pb-8">
      
      {/* 1. TOP WELCOME HERO BANNER (MATCHING SCREENSHOT EXACTLY) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-black tracking-widest uppercase rounded-lg border border-amber-500/30">
              {isCustomer ? 'CUSTOMER PORTAL DASHBOARD' : 'EXECUTIVE ADMIN DASHBOARD'}
            </span>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight leading-tight">
              Welcome back, <span className="text-amber-400">{userName}!</span> 👋
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Track your active equipment rentals, return due dates, quotation requests, and rental billing statements in real-time.
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition-colors">
              <HelpCircle className="w-4 h-4 text-amber-400" /> Need Help?
            </button>

            <a
              href="https://wa.me/94771234567"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <MessageCircle className="w-4 h-4 fill-white" /> WhatsApp Support
            </a>
          </div>
        </div>
      </div>

      {/* 2. THREE QUICK ACTION CARDS GRID (RENT NEW TOOL / PAY NOW / REQUEST QUOTE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Rent New Tool (Solid Yellow) */}
        <Link
          to="/tools"
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 p-6 rounded-2xl font-black flex items-center justify-between transition-all shadow-lg shadow-amber-400/20 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-950/10 flex items-center justify-center text-slate-950">
              <Wrench className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Rent New Tool</h3>
              <p className="text-xs font-semibold text-slate-800 opacity-90 mt-0.5">Browse equipment catalog</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Card 2: Pay Now (Dark Midnight Blue) */}
        <Link
          to="/transactions"
          className="bg-slate-900 hover:bg-slate-800 text-white p-6 rounded-2xl border border-slate-800 font-black flex items-center justify-between transition-all shadow-lg group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Pay Now</h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">Settle rental balances</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Card 3: Request Quote (White / Light Panel) */}
        <Link
          to="/quotations"
          className="bg-white dark:bg-slate-900 hover:border-amber-500/40 text-slate-900 dark:text-white p-6 rounded-2xl border border-slate-200 dark:border-slate-800 font-black flex items-center justify-between transition-all shadow-sm group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <FileText className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Request Quote</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Get custom estimate</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 3. THREE KPI METRIC CARDS WITH COLORED LEFT BORDERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: ACTIVE RENTALS (Green Border) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-emerald-400 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">ACTIVE RENTALS</p>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{activeRentalsCount}</p>
            <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Currently in possession
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Wrench className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Metric 2: PENDING QUOTES (Amber Border) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-400 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">PENDING QUOTES</p>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">0</p>
            <p className="text-xs font-bold text-amber-500 mt-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Estimates under review
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <FileText className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Metric 3: OUTSTANDING PAYMENTS (Blue Border) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">OUTSTANDING PAYMENTS</p>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">LKR 0.00</p>
            <p className="text-xs font-bold text-blue-500 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> All accounts settled
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-lg">
            $
          </div>
        </div>
      </div>

      {/* 4. VISUAL ANALYTICS (For Admin / Executive view) */}
      {!isCustomer && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Monthly Revenue Growth Chart (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-500" /> Monthly Revenue & Financial Growth (LKR)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">6-Month historical income vs operational expenses breakdown</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-extrabold rounded-full border border-emerald-500/30">
                +18.4% growth
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `Rs. ${(val/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#F8FAFC' }}
                    formatter={(val) => [`Rs. ${Number(val).toLocaleString()}`, 'Amount']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Income Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" name="Operating Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Utilization Doughnut Chart (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-amber-500" /> Category Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rental equipment distribution</p>
            </div>

            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryUtilizationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryUtilizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2">
              {categoryUtilizationData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. ACTIVE RENTALS & RETURN DUE DATES TABLE SECTION */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-500" /> Active Rentals & Return Due Dates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track rented equipment, scheduled return due dates, and request hire extensions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-1.5 w-60">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search active tools..."
                className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none w-full"
              />
            </div>

            <Link
              to="/tools"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/20 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Rent More Tools
            </Link>
          </div>
        </div>

        {/* Table Content */}
        {recentRentals.length === 0 && !loadingRentals ? (
          <div className="text-center py-10 space-y-3">
            <Wrench className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-slate-500 text-xs font-semibold">No active tool rentals in possession right now.</p>
            <Link to="/tools" className="inline-block px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs">
              Browse Equipment Catalog
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Tool / Equipment</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Return Due Date</th>
                  <th className="py-3 px-4">Return Countdown</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {recentRentals.map((rental) => {
                  const st = (rental.rentalStatus || rental.status || 'Pending').toLowerCase();
                  return (
                    <tr key={rental._id || rental.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-extrabold text-slate-900 dark:text-slate-100">{rental.tool?.name || rental.toolName || 'Industrial Power Tool'}</p>
                        <span className="text-[10px] text-amber-500 font-mono">{rental.tool?.toolCode || 'TL-001'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {new Date(rental.startDate || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {new Date(rental.endDate || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          <Clock className="w-3 h-3" /> Due in 3 Days
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={rental.rentalStatus || rental.status || 'Active'} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to="/reservations"
                          className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-500 transition-colors"
                        >
                          Manage Hire
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
