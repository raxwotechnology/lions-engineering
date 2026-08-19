import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/Common/StatusBadge';
import { DataTable } from '../components/Common/DataTable';
import { Modal } from '../components/Common/Modal';
import { DollarSign, Plus } from 'lucide-react';

export const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExp, setNewExp] = useState({ title: '', category: 'Maintenance & Repairs', amount: 150, vendor: '' });

  useEffect(() => {
    api.getExpenses().then(res => setExpenses(res.expenses || []));
  }, []);

  const handleAddExpense = (e) => {
    e.preventDefault();
    const created = {
      id: `exp-${Date.now()}`,
      expenseDate: new Date().toISOString().split('T')[0],
      status: 'Paid',
      ...newExp
    };
    setExpenses([created, ...expenses]);
    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Expense Item',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-100">{row.title}</p>
          <p className="text-[11px] text-slate-400">Vendor: {row.vendor || 'N/A'}</p>
        </div>
      )
    },
    { header: 'Category', accessor: 'category' },
    { header: 'Expense Date', accessor: 'expenseDate' },
    { header: 'Amount Paid', render: (row) => <span className="font-bold text-rose-400">${row.amount}</span> },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100">Expenses Tracking</h2>
          <p className="text-xs text-slate-400 mt-1">Log equipment maintenance costs, parts purchases, operational expenses.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Log New Expense
        </button>
      </div>

      <DataTable columns={columns} data={expenses} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Operating Expense">
        <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Expense Title</label>
            <input
              type="text"
              required
              value={newExp.title}
              onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
              placeholder="Excavator Oil & Filter Replacement"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={newExp.category}
                onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
              >
                <option>Maintenance & Repairs</option>
                <option>Tool Acquisition</option>
                <option>Utilities</option>
                <option>Salaries</option>
                <option>Logistics</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Amount ($)</label>
              <input
                type="number"
                required
                value={newExp.amount}
                onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Vendor / Service Provider</label>
            <input
              type="text"
              value={newExp.vendor}
              onChange={(e) => setNewExp({ ...newExp, vendor: e.target.value })}
              placeholder="Heavy Power Mechanics"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">
              Save Expense Entry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
