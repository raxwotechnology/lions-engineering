import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/Common/StatusBadge';
import { DataTable } from '../components/Common/DataTable';
import { Modal } from '../components/Common/Modal';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  ShoppingBag,
  Grid,
  List,
  ShieldAlert,
  Clock,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const Tools = () => {
  const { user } = useAuth();
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);

  // Search and Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Add Tool Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTool, setNewTool] = useState({
    name: '',
    category: 'Power Tools',
    brand: '',
    modelNumber: '',
    dailyRate: '',
    depositAmount: '',
    status: 'Available',
    description: '',
    imageUrl: ''
  });

  // Edit Tool Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: 'Power Tools',
    brand: '',
    modelNumber: '',
    dailyRate: '',
    depositAmount: '',
    status: 'Available',
    description: '',
    imageUrl: ''
  });
  const [editMsg, setEditMsg] = useState('');
  const [updatingTool, setUpdatingTool] = useState(false);

  // Delete Confirmation Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTool, setDeletingTool] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Booking Modal State (Customer)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [bookingData, setBookingData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  });
  const [bookingStatusMsg, setBookingStatusMsg] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const isCustomer = (user?.role || '').toLowerCase() === 'customer';

  useEffect(() => {
    fetchTools();
    fetchCategories();
  }, []);

  // 1. READ: Fetch all tools from MongoDB
  const fetchTools = () => {
    api.getTools().then(res => setTools(res.tools || []));
  };

  const fetchCategories = () => {
    api.getCategories().then(res => setCategories(res.categories || []));
  };

  // LKR Currency Formatter
  const formatLKR = (val) => {
    const num = Number(val || 0);
    const adjusted = num < 500 ? num * 300 : num;
    return `Rs. ${adjusted.toLocaleString('en-LK')}`;
  };

  const getRawLKR = (val) => {
    const num = Number(val || 0);
    return num < 500 ? num * 300 : num;
  };

  // Auto Rental Cost Calculator
  const calculateRentalCost = () => {
    if (!selectedTool) return { days: 1, rentalFee: 0, deposit: 0, grandTotal: 0 };
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const diffTime = Math.max(1, end - start);
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const rate = getRawLKR(selectedTool.pricePerDay || selectedTool.dailyRate || 3500);
    const deposit = getRawLKR(selectedTool.depositAmount || 10000);

    const rentalFee = days * rate;
    const grandTotal = rentalFee + deposit;

    return { days, rate, rentalFee, deposit, grandTotal };
  };

  const costCalc = calculateRentalCost();

  // 2. CREATE: Add New Tool to MongoDB Atlas
  const handleAddTool = (e) => {
    e.preventDefault();
    api.createTool({
      name: newTool.name,
      category: newTool.category,
      brand: newTool.brand,
      toolCode: newTool.modelNumber ? `TL-${newTool.modelNumber}` : `TL-${Math.floor(1000 + Math.random() * 9000)}`,
      dailyRate: Number(newTool.dailyRate),
      pricePerDay: Number(newTool.dailyRate),
      depositAmount: Number(newTool.depositAmount),
      status: newTool.status,
      isAvailable: newTool.status === 'Available',
      description: newTool.description,
      imageUrl: newTool.imageUrl
    }).then(res => {
      if (res.tool) {
        setTools([res.tool, ...tools]);
        setIsModalOpen(false);
        setNewTool({
          name: '',
          category: 'Power Tools',
          brand: '',
          modelNumber: '',
          dailyRate: '',
          depositAmount: '',
          status: 'Available',
          description: '',
          imageUrl: ''
        });
      }
    });
  };

  // 3. UPDATE: Open Edit Modal with Pre-filled Tool Details
  const handleOpenEditModal = (tool) => {
    setEditingTool(tool);
    setEditMsg('');
    const catName = typeof tool.category === 'object' ? (tool.category?.name || 'Power Tools') : (tool.category || 'Power Tools');
    setEditFormData({
      name: tool.name || '',
      category: catName,
      brand: tool.brand || '',
      modelNumber: (tool.toolCode || '').replace('TL-', ''),
      dailyRate: tool.pricePerDay || tool.dailyRate || '',
      depositAmount: tool.depositAmount || 10000,
      status: tool.isAvailable === false ? 'Rented' : (tool.status || 'Available'),
      description: tool.description || '',
      imageUrl: tool.imageUrl || ''
    });
    setIsEditModalOpen(true);
  };

  // UPDATE: Save Edits to MongoDB via PUT /api/tools/:id
  const handleSaveEditedTool = async (e) => {
    e.preventDefault();
    if (!editingTool) return;
    setUpdatingTool(true);
    setEditMsg('');

    const toolId = editingTool.id || editingTool._id;

    try {
      const res = await fetch(`/api/tools/${toolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          name: editFormData.name,
          category: editFormData.category,
          brand: editFormData.brand,
          toolCode: editFormData.modelNumber ? `TL-${editFormData.modelNumber}` : editingTool.toolCode,
          pricePerDay: Number(editFormData.dailyRate),
          dailyRate: Number(editFormData.dailyRate),
          depositAmount: Number(editFormData.depositAmount),
          status: editFormData.status,
          isAvailable: editFormData.status === 'Available',
          description: editFormData.description,
          imageUrl: editFormData.imageUrl
        })
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?sessionExpired=true';
        return;
      }

      const data = await res.json();

      if (res.ok && data.success) {
        setEditMsg('✅ Equipment updated successfully!');
        setTimeout(() => {
          setIsEditModalOpen(false);
          fetchTools();
        }, 1200);
      } else {
        setEditMsg(`❌ ${data.message || 'Failed to update tool details'}`);
      }
    } catch (err) {
      setEditMsg(`❌ ${err.message || 'Server error occurred'}`);
    } finally {
      setUpdatingTool(false);
    }
  };

  // 4. DELETE: Open Delete Confirmation Modal
  const handleOpenDeleteModal = (tool) => {
    setDeletingTool(tool);
    setIsDeleteModalOpen(true);
  };

  // DELETE: Confirm Delete from MongoDB via DELETE /api/tools/:id
  const handleConfirmDelete = async () => {
    if (!deletingTool) return;
    setDeletingLoading(true);

    const toolId = deletingTool.id || deletingTool._id;

    try {
      const res = await fetch(`/api/tools/${toolId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?sessionExpired=true';
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setTools(tools.filter(t => (t.id !== toolId && t._id !== toolId)));
        setIsDeleteModalOpen(false);
        setDeletingTool(null);
      } else {

        alert(data.message || 'Failed to delete tool.');
      }
    } catch (err) {
      alert(err.message || 'Server error occurred.');
    } finally {
      setDeletingLoading(false);
    }
  };

  const handleOpenRentModal = (tool) => {
    setSelectedTool(tool);
    setBookingStatusMsg('');
    setIsBookingModalOpen(true);
  };

  const handleCreateRentalRequest = async (e) => {
    e.preventDefault();
    if (!selectedTool) return;
    setSubmittingBooking(true);
    setBookingStatusMsg('');

    try {
      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          tool: selectedTool.id || selectedTool._id,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          totalPrice: costCalc.grandTotal
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookingStatusMsg('🎉 Rental request submitted successfully! Tracking added to My Rentals.');
        setTimeout(() => {
          setIsBookingModalOpen(false);
          fetchTools();
        }, 1800);
      } else {
        setBookingStatusMsg(`❌ ${data.message || 'Rental request failed'}`);
      }
    } catch (err) {
      setBookingStatusMsg(`❌ ${err.message || 'Server connection error'}`);
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Real-time Search & Filter Evaluation
  const filteredTools = tools.filter(tool => {
    const nameStr = tool.name || '';
    const codeStr = tool.toolCode || '';
    const brandStr = tool.brand || '';
    const catStr = typeof tool.category === 'object' ? (tool.category?.name || '') : (tool.category || '');

    const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          codeStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          brandStr.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || catStr.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus = statusFilter === 'All' || tool.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const columns = [
    {
      header: 'Tool Equipment',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 overflow-hidden shrink-0">
            {row.imageUrl ? (
              <img src={row.imageUrl} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <Wrench className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="font-bold text-slate-100">{row.name}</p>
            <p className="text-[11px] text-slate-400 font-mono">{row.toolCode || 'TL-001'} • {row.brand || 'Equipment'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      render: (row) => (
        <span className="font-semibold text-slate-200">
          {typeof row.category === 'object' ? row.category?.name : (row.category || 'General')}
        </span>
      )
    },
    {
      header: 'Daily Rate (LKR)',
      render: (row) => <span className="font-bold text-amber-400">{formatLKR(row.pricePerDay || row.dailyRate || 0)} / day</span>
    },
    {
      header: 'Security Deposit',
      render: (row) => <span className="text-slate-300 font-medium">{formatLKR(row.depositAmount || 0)}</span>
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.isAvailable === false ? 'Rented' : (row.status || 'Available')} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {isCustomer ? (
            <button
              onClick={() => handleOpenRentModal(row)}
              disabled={row.isAvailable === false || row.status === 'Rented'}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                row.isAvailable === false || row.status === 'Rented'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Rent Now
            </button>
          ) : (
            <>
              <button
                onClick={() => handleOpenEditModal(row)}
                className="px-2.5 py-1 bg-[#F59E0B] hover:bg-amber-600 text-[#0F172A] font-extrabold rounded-lg text-xs flex items-center gap-1 shadow-md shadow-amber-500/20"
                title="Edit Tool Details"
              >
                <Edit className="w-3.5 h-3.5 stroke-[2.5]" /> Edit
              </button>
              <button
                onClick={() => handleOpenDeleteModal(row)}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 text-xs border border-slate-700"
                title="Delete Tool"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-100">
              {isCustomer ? 'Sri Lanka Tool Rental Catalog' : 'Tool Inventory Management Module'}
            </h2>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              LKR (Rs.)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isCustomer
              ? 'Browse high-performance equipment, check daily hire rates in LKR, and place instant booking requests.'
              : 'Complete CRUD management of tools, daily hire rates, security deposits, availability statuses, and catalog listings.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isCustomer && (
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                title="Grid Catalog View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                title="Table Inventory View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 5. Role-Based Protection: Hide + Add New Tool for Customers */}
          {!isCustomer && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Add New Tool Equipment
            </button>
          )}
        </div>
      </div>

      {/* 1. Real-time Search Bar & Filter Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 w-full sm:w-80 focus-within:border-amber-500/50">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by tool title, code (TL-001), or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full placeholder:text-slate-500 font-medium"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs shrink-0">
              {['All', 'Available', 'Rented', 'Maintenance'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === st ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider shrink-0">Categories:</span>
          {['All', 'Power Tools', 'Heavy Machinery', 'Concrete & Masonry', 'Lawn & Garden', 'Scaffolding & Safety'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                categoryFilter === cat
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Card Catalog View */}
      {(isCustomer || viewMode === 'grid') ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => {
            const isAvailable = tool.isAvailable !== false && tool.status !== 'Rented' && tool.status !== 'Maintenance';
            const catName = typeof tool.category === 'object' ? (tool.category?.name || 'General') : (tool.category || 'General');

            return (
              <div
                key={tool.id || tool._id}
                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1"
              >
                <div>
                  {/* Card Image Container */}
                  <div className="relative h-44 bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center border-b border-slate-200 dark:border-slate-800">
                    {tool.imageUrl ? (
                      <img
                        src={tool.imageUrl}
                        alt={tool.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2">
                        <Wrench className="w-12 h-12 stroke-[1.5] text-amber-500/50" />
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sri Lanka Tool Spec</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 dark:bg-slate-950/80 backdrop-blur-md text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                        {catName}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={isAvailable ? 'Available' : (tool.status || 'Rented')} />
                    </div>
                  </div>

                  {/* Details Body */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-amber-600 dark:text-amber-400">{tool.brand || 'Pro Grade'}</span>
                      <span className="font-mono font-bold text-slate-500 dark:text-slate-400">{tool.toolCode || 'TL-001'}</span>
                    </div>

                    <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                      {tool.name}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                      {tool.description || 'Heavy-duty professional grade tool suitable for construction and industrial hire in Sri Lanka.'}
                    </p>
                  </div>
                </div>

                {/* Price & Role Action Footer */}
                <div className="p-5 pt-0 space-y-3">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Rental Rate</p>
                      <p className="font-black text-amber-600 dark:text-amber-400 text-sm">{formatLKR(tool.pricePerDay || tool.dailyRate || 3500)} <span className="text-[10px] font-normal text-slate-500">/ day</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Security Deposit</p>
                      <p className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">{formatLKR(tool.depositAmount || 10000)}</p>
                    </div>
                  </div>

                  {/* 5. Role-Based Protection */}
                  {isCustomer ? (
                    <button
                      onClick={() => handleOpenRentModal(tool)}
                      disabled={!isAvailable}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        !isAvailable
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-[1.01]'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" /> {isAvailable ? 'Rent Now' : 'Currently Rented'}
                    </button>
                  ) : (
                    /* Admin / Manager CRUD Buttons */
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(tool)}
                        className="flex-1 py-2.5 bg-[#F59E0B] hover:bg-amber-600 text-[#0F172A] font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.01]"
                      >
                        <Edit className="w-4 h-4 stroke-[2.5]" /> Edit Tool Details
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(tool)}
                        className="py-2.5 px-3 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs border border-slate-700 hover:border-rose-500/30 transition-all"
                        title="Delete Tool Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Data Table View for Admin / Management */
        <DataTable columns={columns} data={filteredTools} />
      )}

      {/* 2. CREATE: Add New Tool Modal */}
      {!isCustomer && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Tool Equipment">
          <form onSubmit={handleAddTool} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tool Title / Name</label>
              <input
                type="text"
                required
                value={newTool.name}
                onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                placeholder="e.g. Bosch Heavy Duty Hammer Drill"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={newTool.category}
                  onChange={(e) => setNewTool({ ...newTool, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50 font-medium"
                >
                  <option>Power Tools</option>
                  <option>Heavy Machinery</option>
                  <option>Concrete & Masonry</option>
                  <option>Lawn & Garden</option>
                  <option>Scaffolding & Safety</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Brand & Model Code</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newTool.brand}
                    onChange={(e) => setNewTool({ ...newTool, brand: e.target.value })}
                    placeholder="DeWalt"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50"
                  />
                  <input
                    type="text"
                    value={newTool.modelNumber}
                    onChange={(e) => setNewTool({ ...newTool, modelNumber: e.target.value })}
                    placeholder="001"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Daily Rate (LKR)</label>
                <input
                  type="number"
                  required
                  value={newTool.dailyRate}
                  onChange={(e) => setNewTool({ ...newTool, dailyRate: e.target.value })}
                  placeholder="3500"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Security Deposit (LKR)</label>
                <input
                  type="number"
                  required
                  value={newTool.depositAmount}
                  onChange={(e) => setNewTool({ ...newTool, depositAmount: e.target.value })}
                  placeholder="10000"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Status</label>
                <select
                  value={newTool.status}
                  onChange={(e) => setNewTool({ ...newTool, status: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50 font-medium"
                >
                  <option value="Available">Available</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            {/* Direct Image File Upload & Visual Preset Selector */}
            <div className="space-y-2">
              <label className="block text-slate-300 font-semibold mb-1">Equipment Image (Upload File or Select Preset)</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-3 bg-slate-900/80 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[90px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewTool({ ...newTool, imageUrl: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-5 h-5 text-amber-400 mb-1" />
                  <span className="text-[11px] font-bold text-slate-200">Upload Image File</span>
                  <span className="text-[9px] text-slate-500">PNG, JPG, WEBP up to 5MB</span>
                </div>

                <div className="h-[90px] rounded-xl border border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center relative">
                  {newTool.imageUrl ? (
                    <>
                      <img src={newTool.imageUrl} alt="Tool Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewTool({ ...newTool, imageUrl: '' })}
                        className="absolute top-1.5 right-1.5 bg-slate-950/80 text-rose-400 p-1 rounded-lg text-[10px] font-bold border border-rose-500/30"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-slate-600 space-y-0.5">
                      <ImageIcon className="w-5 h-5 mx-auto" />
                      <p className="text-[10px]">No image selected</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1.5">Or Choose Equipment Preset Photo:</p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    { label: 'Hammer Drill', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop' },
                    { label: 'Excavator', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=600&auto=format&fit=crop' },
                    { label: 'Power Saw', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop' },
                    { label: 'Concrete Mixer', url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=600&auto=format&fit=crop' }
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => setNewTool({ ...newTool, imageUrl: preset.url })}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-medium text-slate-300 shrink-0 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" /> {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Description</label>
              <textarea
                rows={3}
                value={newTool.description}
                onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                placeholder="Technical specifications and details..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20"
              >
                Save Tool Equipment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. UPDATE: Edit Tool Modal */}
      {editingTool && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Tool Equipment: ${editingTool.name}`}
        >
          <form onSubmit={handleSaveEditedTool} className="space-y-4 text-xs">
            {editMsg && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl font-bold text-center">
                {editMsg}
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tool Title</label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50 font-medium"
                >
                  <option>Power Tools</option>
                  <option>Heavy Machinery</option>
                  <option>Concrete & Masonry</option>
                  <option>Lawn & Garden</option>
                  <option>Scaffolding & Safety</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Brand & Model Code</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={editFormData.brand}
                    onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                    placeholder="DeWalt"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50 font-medium"
                  />
                  <input
                    type="text"
                    value={editFormData.modelNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, modelNumber: e.target.value })}
                    placeholder="001"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50 font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Daily Rate (LKR)</label>
                <input
                  type="number"
                  required
                  value={editFormData.dailyRate}
                  onChange={(e) => setEditFormData({ ...editFormData, dailyRate: e.target.value })}
                  placeholder="3500"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deposit (LKR)</label>
                <input
                  type="number"
                  required
                  value={editFormData.depositAmount}
                  onChange={(e) => setEditFormData({ ...editFormData, depositAmount: e.target.value })}
                  placeholder="10000"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Availability Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50 font-medium"
                >
                  <option value="Available">Available</option>
                  <option value="Rented">Rented Out</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-300 font-semibold mb-1">Update Equipment Photo</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-3 bg-slate-900/80 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[85px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditFormData({ ...editFormData, imageUrl: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-5 h-5 text-amber-400 mb-1" />
                  <span className="text-[11px] font-bold text-slate-200">Upload New Photo</span>
                </div>

                <div className="h-[85px] rounded-xl border border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center relative">
                  {editFormData.imageUrl ? (
                    <>
                      <img src={editFormData.imageUrl} alt="Tool Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, imageUrl: '' })}
                        className="absolute top-1.5 right-1.5 bg-slate-950/80 text-rose-400 p-1 rounded-lg text-[10px] font-bold border border-rose-500/30"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-slate-600 space-y-0.5">
                      <ImageIcon className="w-5 h-5 mx-auto" />
                      <p className="text-[10px]">No image selected</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Description</label>
              <textarea
                rows={3}
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Technical specifications..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50 font-medium"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingTool}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> {updatingTool ? 'SAVING...' : 'SAVE EDITED TOOL DETAILS'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 4. DELETE: Custom Delete Confirmation Modal */}
      {deletingTool && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Delete Tool Equipment"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-slate-100 text-sm">Are you sure you want to delete {deletingTool.name}?</h4>
                <p className="text-slate-400 mt-1 text-xs">
                  This action will permanently delete the document from MongoDB Atlas. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-slate-300">
              <span className="font-bold text-slate-100">{deletingTool.name}</span>
              <span className="font-mono text-amber-400">{deletingTool.toolCode || 'TL-001'}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingLoading}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> {deletingLoading ? 'DELETING...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Customer Rental Booking Modal */}
      {selectedTool && (
        <Modal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          title={`Rent Equipment: ${selectedTool.name}`}
        >
          <form onSubmit={handleCreateRentalRequest} className="space-y-4 text-xs">
            {bookingStatusMsg && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl font-semibold text-center">
                {bookingStatusMsg}
              </div>
            )}

            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 overflow-hidden shrink-0">
                {selectedTool.imageUrl ? (
                  <img src={selectedTool.imageUrl} alt={selectedTool.name} className="w-full h-full object-cover" />
                ) : (
                  <Wrench className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-100 truncate text-sm">{selectedTool.name}</p>
                <p className="text-[11px] text-slate-400">{selectedTool.brand || 'Professional'} • {typeof selectedTool.category === 'object' ? selectedTool.category?.name : (selectedTool.category || 'Power Tools')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> Start Date
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.startDate}
                  onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> End Date
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.endDate}
                  onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-slate-800">
                <span className="font-semibold text-slate-400">Duration:</span>
                <span className="font-bold text-amber-400">{costCalc.days} Day(s)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Daily Rate:</span>
                <span>{formatLKR(costCalc.rate)} / day</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Rental Fee ({costCalc.days} days):</span>
                <span className="font-semibold text-slate-200">{formatLKR(costCalc.rentalFee)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Refundable Security Deposit:</span>
                <span className="font-semibold text-slate-200">{formatLKR(costCalc.deposit)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm">
                <span className="font-extrabold text-slate-100">Estimated Total Cost:</span>
                <span className="font-black text-emerald-400 text-base">{formatLKR(costCalc.grandTotal)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingBooking}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20"
              >
                {submittingBooking ? 'Submitting Request...' : 'Confirm Rental Booking'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
