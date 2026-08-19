import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/Common/StatusBadge';
import { DataTable } from '../components/Common/DataTable';
import { Modal } from '../components/Common/Modal';
import { Truck, Plus, Star, Mail, Phone } from 'lucide-react';

export const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSup, setNewSup] = useState({ companyName: '', contactPerson: '', email: '', phone: '' });

  useEffect(() => {
    api.getSuppliers().then(res => setSuppliers(res.suppliers || []));
  }, []);

  const handleAddSupplier = (e) => {
    e.preventDefault();
    const created = {
      id: `sup-${Date.now()}`,
      supplierCode: `SUP-00${suppliers.length + 1}`,
      ...newSup,
      rating: 5.0,
      status: 'Active'
    };
    setSuppliers([created, ...suppliers]);
    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Supplier Vendor',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-100">{row.companyName}</p>
          <p className="text-[11px] text-slate-400 font-mono">{row.supplierCode} • Contact: {row.contactPerson}</p>
        </div>
      )
    },
    {
      header: 'Communication',
      render: (row) => (
        <div className="space-y-0.5 text-xs text-slate-300">
          <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-500" /> {row.email}</p>
          <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-500" /> {row.phone}</p>
        </div>
      )
    },
    {
      header: 'Supplier Rating',
      render: (row) => (
        <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400" /> {row.rating}
        </div>
      )
    },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100">Suppliers Management</h2>
          <p className="text-xs text-slate-400 mt-1">Directory of equipment suppliers, machine manufacturers, and vendors.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Register Supplier
        </button>
      </div>

      <DataTable columns={columns} data={suppliers} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Equipment Supplier">
        <form onSubmit={handleAddSupplier} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Company / Vendor Name</label>
            <input
              type="text"
              required
              value={newSup.companyName}
              onChange={(e) => setNewSup({ ...newSup, companyName: e.target.value })}
              placeholder="Industrial Power Distribution Ltd"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Contact Person</label>
            <input
              type="text"
              required
              value={newSup.contactPerson}
              onChange={(e) => setNewSup({ ...newSup, contactPerson: e.target.value })}
              placeholder="Mark Stevens"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email</label>
              <input
                type="email"
                required
                value={newSup.email}
                onChange={(e) => setNewSup({ ...newSup, email: e.target.value })}
                placeholder="sales@vendor.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone</label>
              <input
                type="text"
                required
                value={newSup.phone}
                onChange={(e) => setNewSup({ ...newSup, phone: e.target.value })}
                placeholder="+1 555-0900"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">
              Save Supplier Details
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
