import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/Common/StatusBadge';
import { DataTable } from '../components/Common/DataTable';
import { Modal } from '../components/Common/Modal';
import { Grid, Plus, Zap, Truck, Layers, Scissors, Shield } from 'lucide-react';

export const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', code: '', description: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isCustomer = (user?.role || '').toLowerCase() === 'customer';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    api.getCategories().then(res => setCategories(res.categories || []));
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(newCategory)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setNewCategory({ name: '', code: '', description: '' });
        fetchCategories();
      } else {
        setErrorMsg(data.message || 'Failed to create category.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Server error.');
    } finally {
      setLoading(false);
    }
  };

  const iconMap = {
    Zap: Zap,
    Truck: Truck,
    Layers: Layers,
    Scissors: Scissors,
    Shield: Shield
  };

  const columns = [
    {
      header: 'Category Name',
      render: (row) => {
        const Icon = iconMap[row.icon] || Grid;
        return (
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
              <Icon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{row.name}</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono font-bold">Code: {row.code || 'GEN'}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Description',
      render: (row) => (
        <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">
          {row.description || 'Standard tool category'}
        </span>
      )
    },
    {
      header: 'Associated Tools',
      render: (row) => (
        <span className="font-extrabold text-amber-600 dark:text-amber-400 text-xs">
          {row.count || 5} Tools
        </span>
      )
    },
    { header: 'Status', render: (row) => <StatusBadge status={row.status || 'Active'} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100">Tool Categories</h2>
          <p className="text-xs text-slate-400 mt-1">Organize tools and equipment into structured inventory categories.</p>
        </div>

        {/* Restrict + Add Category button: Hide for Customers */}
        {!isCustomer && (
          <button
            onClick={() => { setErrorMsg(''); setIsModalOpen(true); }}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      <DataTable columns={columns} data={categories} />

      {/* Modal Add Category (Admin / Manager / Owner Only) */}
      {!isCustomer && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Category">
          <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center font-bold">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category Name</label>
              <input
                type="text"
                required
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="e.g. Earthmoving & Trenching"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Short Code (3 letters)</label>
              <input
                type="text"
                required
                maxLength={3}
                value={newCategory.code}
                onChange={(e) => setNewCategory({ ...newCategory, code: e.target.value })}
                placeholder="EMT"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 uppercase font-mono focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Description</label>
              <textarea
                rows={3}
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Category overview..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-amber-500/50"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-400 font-semibold hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20"
              >
                {loading ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
