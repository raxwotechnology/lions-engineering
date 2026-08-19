import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/Common/StatusBadge';
import { DataTable } from '../components/Common/DataTable';
import { Modal } from '../components/Common/Modal';
import { FileText, Plus, Send, Eye, Edit, Printer, Wrench, Calendar, Building, CheckCircle2 } from 'lucide-react';

export const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // View Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);

  const [newQt, setNewQt] = useState({
    customerName: '',
    totalAmount: 185000,
    validUntil: '2026-08-30',
    itemsCount: 2,
    notes: 'Includes delivery and site setup in Colombo area.'
  });

  useEffect(() => {
    api.getQuotations().then(res => setQuotations(res.quotations || []));
  }, []);

  const formatLKR = (val) => {
    const num = Number(val || 0);
    const adjusted = num < 500 ? num * 300 : num;
    return `Rs. ${adjusted.toLocaleString('en-LK')}`;
  };

  const formatDateClean = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const formatToolCount = (count) => {
    const num = Number(count || 1);
    return `${num} ${num === 1 ? 'Tool' : 'Tools'}`;
  };

  const handleCreateQuotation = (e) => {
    e.preventDefault();
    const created = {
      id: `qt-${Date.now()}`,
      quotationNumber: `QT-2026-0${quotations.length + 13}`,
      ...newQt,
      totalAmount: Number(newQt.totalAmount),
      status: 'Sent'
    };
    setQuotations([created, ...quotations]);
    setIsModalOpen(false);
    setNewQt({ customerName: '', totalAmount: 185000, validUntil: '2026-08-30', itemsCount: 2, notes: '' });
  };

  const handleSaveEditQuotation = (e) => {
    e.preventDefault();
    if (!editingQuotation) return;
    setQuotations(quotations.map(q => q.id === editingQuotation.id ? editingQuotation : q));
    setIsEditModalOpen(false);
    setEditingQuotation(null);
  };

  const handleOpenViewModal = (qt) => {
    setSelectedQuotation(qt);
    setIsViewModalOpen(true);
  };

  const handleOpenEditModal = (qt) => {
    setEditingQuotation({ ...qt });
    setIsEditModalOpen(true);
  };

  const handlePrintQuotation = (qt) => {
    setSelectedQuotation(qt);
    setIsViewModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const columns = [
    {
      header: 'Quote Number',
      render: (row) => <span className="font-mono text-amber-400 font-bold">{row.quotationNumber}</span>
    },
    {
      header: 'Customer / Business',
      render: (row) => <span className="font-bold text-slate-100">{row.customerName}</span>
    },
    {
      header: 'Equipment Billed',
      render: (row) => <span className="font-medium text-slate-300">{formatToolCount(row.itemsCount)}</span>
    },
    {
      header: 'Quoted Total (LKR)',
      render: (row) => <span className="font-extrabold text-amber-400">{formatLKR(row.totalAmount)}</span>
    },
    {
      header: 'Valid Until Date',
      render: (row) => <span className="font-mono text-slate-300 text-xs">{formatDateClean(row.validUntil)}</span>
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status || 'Sent'} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenViewModal(row)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
            title="View Quotation Details"
          >
            <Eye className="w-3.5 h-3.5" /> View
          </button>
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
            title="Edit Quotation"
          >
            <Edit className="w-3.5 h-3.5 text-amber-400" /> Edit
          </button>
          <button
            onClick={() => handlePrintQuotation(row)}
            className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 border border-amber-500/30"
            title="Print PDF Quotation Sheet"
          >
            <Printer className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100">Tool Rental Quotations</h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate equipment hire estimates, send formal quotations to corporate clients, and print PDF sheets in LKR.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Create New Quotation
        </button>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={quotations} />

      {/* CREATE QUOTATION MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Rental Quotation">
        <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Customer / Organization Name</label>
            <input
              type="text"
              required
              value={newQt.customerName}
              onChange={(e) => setNewQt({ ...newQt, customerName: e.target.value })}
              placeholder="e.g. Apex Builders LLC"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Quoted Total (LKR)</label>
              <input
                type="number"
                required
                value={newQt.totalAmount}
                onChange={(e) => setNewQt({ ...newQt, totalAmount: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Equipment Count</label>
              <input
                type="number"
                required
                value={newQt.itemsCount}
                onChange={(e) => setNewQt({ ...newQt, itemsCount: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Valid Until Date</label>
              <input
                type="date"
                required
                value={newQt.validUntil}
                onChange={(e) => setNewQt({ ...newQt, validUntil: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Quotation Notes & Scope of Work</label>
            <textarea
              rows={3}
              value={newQt.notes}
              onChange={(e) => setNewQt({ ...newQt, notes: e.target.value })}
              placeholder="Include delivery terms, security deposit terms, site location..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 font-semibold hover:bg-slate-800 rounded-xl">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20">
              <Send className="w-3.5 h-3.5" /> Issue Quotation
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT QUOTATION MODAL */}
      {editingQuotation && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Quotation: ${editingQuotation.quotationNumber}`}>
          <form onSubmit={handleSaveEditQuotation} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Customer / Organization Name</label>
              <input
                type="text"
                required
                value={editingQuotation.customerName}
                onChange={(e) => setEditingQuotation({ ...editingQuotation, customerName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Quoted Total (LKR)</label>
                <input
                  type="number"
                  required
                  value={editingQuotation.totalAmount}
                  onChange={(e) => setEditingQuotation({ ...editingQuotation, totalAmount: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Equipment Count</label>
                <input
                  type="number"
                  required
                  value={editingQuotation.itemsCount}
                  onChange={(e) => setEditingQuotation({ ...editingQuotation, itemsCount: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Valid Until Date</label>
                <input
                  type="date"
                  required
                  value={editingQuotation.validUntil}
                  onChange={(e) => setEditingQuotation({ ...editingQuotation, validUntil: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-slate-400 font-semibold">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl">
                Save Quotation Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW & PRINT QUOTATION MODAL */}
      {selectedQuotation && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Quotation Sheet - ${selectedQuotation.quotationNumber}`}>
          <div className="space-y-6 text-slate-900 bg-white p-6 rounded-2xl print:p-0 print:shadow-none print:bg-white" id="printable-invoice">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                    <Wrench className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="font-black text-lg text-slate-900 tracking-tight">LIONS ENGINEERING & TOOL RENTALS</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">145 Industrial Zone Road, Colombo 05, Sri Lanka</p>
                <p className="text-[10px] text-slate-400">Tel: 0112345678 | WhatsApp: +94771234567</p>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs">
                  FORMAL QUOTATION
                </span>
                <p className="text-xs font-mono font-bold text-slate-800 mt-2">{selectedQuotation.quotationNumber}</p>
                <p className="text-[11px] text-slate-500">Valid Until: {formatDateClean(selectedQuotation.validUntil)}</p>
              </div>
            </div>

            {/* Customer & Quote Details */}
            <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Prepared For (Client)</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedQuotation.customerName}</p>
                <p className="text-slate-600">Site Location: Colombo & Western Province</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Quotation Summary</p>
                <p className="font-bold text-slate-900 mt-0.5">Billed Items: {formatToolCount(selectedQuotation.itemsCount)}</p>
                <p className="text-slate-600">Status: <span className="font-bold text-emerald-600 uppercase">{selectedQuotation.status || 'Active'}</span></p>
              </div>
            </div>

            {/* Itemized Table */}
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-y border-slate-200">
                  <th className="py-2.5 px-3">Tool Equipment Scope</th>
                  <th className="py-2.5 px-3 text-center">Estimated Duration</th>
                  <th className="py-2.5 px-3 text-right">Quoted Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                <tr>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">Heavy Industrial Construction Package ({formatToolCount(selectedQuotation.itemsCount)})</p>
                    <p className="text-[10px] text-slate-500">Includes operator safety manuals & site delivery service.</p>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">5 Hire Days</td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-900">{formatLKR(selectedQuotation.totalAmount)}</td>
                </tr>
              </tbody>
            </table>

            {/* Total */}
            <div className="flex justify-between items-end border-t border-slate-200 pt-4">
              <p className="text-[11px] text-slate-500">Prices valid for 14 days from issue date. Subject to availability.</p>
              <div className="text-right text-xs">
                <p className="text-slate-600">Estimated Total Quote:</p>
                <p className="text-base font-black text-amber-600 font-mono">{formatLKR(selectedQuotation.totalAmount)}</p>
              </div>
            </div>

            {/* Print Action */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 print:hidden">
              <button type="button" onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl text-xs">
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/20"
              >
                <Printer className="w-4 h-4" /> Direct Print Quotation Sheet
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
