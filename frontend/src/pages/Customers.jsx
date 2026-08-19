import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/Common/StatusBadge';
import { DataTable } from '../components/Common/DataTable';
import { Modal } from '../components/Common/Modal';
import { Users, Plus, Mail, Phone, Building, Shield, MapPin, Eye, FileText } from 'lucide-react';

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/customers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      const data = await res.json();
      if (res.ok && data.customers && data.customers.length > 0) {
        setCustomers(data.customers);
      } else {
        const fallback = await api.getCustomers();
        setCustomers(fallback.customers || []);
      }
    } catch (err) {
      const fallback = await api.getCustomers();
      setCustomers(fallback.customers || []);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (cust) => {
    setSelectedCustomer(cust);
    setIsViewModalOpen(true);
  };

  const columns = [
    {
      header: 'Customer Renter',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-100">{row.name || row.fullName}</p>
          <p className="text-[11px] text-slate-400 font-mono">
            {row.customerCode || `CUST-${(row.id || row._id || '').slice(-4).toUpperCase()}`}
          </p>
        </div>
      )
    },
    {
      header: 'Contact Info',
      render: (row) => (
        <div className="space-y-0.5 text-xs text-slate-300">
          <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-amber-400" /> {row.email}</p>
          <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-emerald-400" /> {row.phone}</p>
        </div>
      )
    },
    {
      header: 'Company / Org',
      render: (row) => row.companyName ? (
        <span className="font-semibold text-slate-200">{row.companyName}</span>
      ) : (
        <span className="text-slate-500 italic">Individual Renter</span>
      )
    },
    {
      header: 'Delivery Address',
      render: (row) => {
        const addr = row.address;
        if (!addr || (!addr.street && !addr.city)) {
          return <span className="text-slate-500 text-xs italic">Not Provided</span>;
        }
        return (
          <div className="text-xs text-slate-300 flex items-start gap-1 max-w-[200px]">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <span className="truncate">{addr.street || ''} {addr.city ? `, ${addr.city}` : ''} {addr.district ? `(${addr.district})` : ''}</span>
          </div>
        );
      }
    },
    {
      header: 'ID Document',
      render: (row) => (
        <span className="font-mono text-xs text-slate-300">
          {row.nicOrPassport || row.idProofNumber || 'Not Specified'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleOpenDetails(row)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700"
        >
          <Eye className="w-3.5 h-3.5" /> Dispatch Info
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100">Customer Directory & Dispatch Hub</h2>
          <p className="text-xs text-slate-400 mt-1">
            Registered customer profiles, site delivery addresses, mobile contacts, and verification documents.
          </p>
        </div>
      </div>

      <DataTable columns={columns} data={customers} />

      {/* Customer Dispatch Details Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Customer Profile & Dispatch Info: ${selectedCustomer.name || selectedCustomer.fullName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-slate-100 text-base">{selectedCustomer.name || selectedCustomer.fullName}</h4>
                  <p className="text-amber-400 font-mono font-bold text-xs">{selectedCustomer.customerCode || 'CUST-DIRECT'}</p>
                </div>
                <StatusBadge status={selectedCustomer.status || 'Active'} />
              </div>
              {selectedCustomer.companyName && (
                <p className="text-slate-300 font-medium flex items-center gap-1.5 pt-1">
                  <Building className="w-4 h-4 text-slate-400" /> Company: {selectedCustomer.companyName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500">Contact Details</p>
                <p className="text-slate-200 font-semibold flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-400" /> {selectedCustomer.email}</p>
                <p className="text-slate-200 font-semibold flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-400" /> {selectedCustomer.phone}</p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500">Identity Verification</p>
                <p className="text-slate-200 font-mono font-semibold pt-1">
                  NIC / Passport: {selectedCustomer.nicOrPassport || selectedCustomer.idProofNumber || 'Not Specified'}
                </p>
              </div>
            </div>

            {/* Delivery & Site Address Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2">
              <p className="text-[10px] uppercase font-extrabold text-amber-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Tool Delivery & Equipment Dispatch Address
              </p>
              {selectedCustomer.address && (selectedCustomer.address.street || selectedCustomer.address.city) ? (
                <div className="text-slate-200 font-medium space-y-0.5">
                  <p className="font-bold">{selectedCustomer.address.street}</p>
                  <p>{selectedCustomer.address.city}{selectedCustomer.address.district ? `, ${selectedCustomer.address.district}` : ''}</p>
                  <p className="text-slate-400 font-mono text-[11px]">Postal Code: {selectedCustomer.address.postalCode || 'N/A'}</p>
                </div>
              ) : (
                <p className="text-slate-400 italic">No delivery address specified in customer profile yet.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
              >
                Close Dispatch Info
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
