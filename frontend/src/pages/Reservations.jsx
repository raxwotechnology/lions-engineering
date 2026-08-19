import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/Common/StatusBadge';
import { DataTable } from '../components/Common/DataTable';
import { Modal } from '../components/Common/Modal';
import { InvoiceModal } from '../components/Common/InvoiceModal';
import { ReviewModal } from '../components/Common/ReviewModal';
import { PaymentCheckoutModal } from '../components/Common/PaymentCheckoutModal';
import { PrintLanguageChoiceModal } from '../components/Common/PrintLanguageChoiceModal';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  User,
  Building,
  Truck,
  Printer,
  Star,
  Clock,
  AlertTriangle,
  Languages,
  CreditCard,
  RotateCcw,
  MessageSquare,
  Plus,
  Wrench,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const Reservations = () => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedRental, setSelectedRental] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLangChoiceOpen, setIsLangChoiceOpen] = useState(false);
  const [invoiceLang, setInvoiceLang] = useState('en');
  const [pendingReservationForInvoice, setPendingReservationForInvoice] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const isCustomer = (user?.role || '').toLowerCase() === 'customer';

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rentals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      const data = await res.json();
      if (res.ok && data.rentals) {
        setRentals(data.rentals);
      } else {
        setRentals([]);
      }
    } catch (err) {
      console.warn('Fallback rentals fetch error:', err);
    } finally {
      setLoading(false);
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
        fetchRentals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatLKR = (val) => `Rs. ${Number(val || 0).toLocaleString('en-LK')}`;

  const formatDateClean = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const handleViewCustomerDetails = (rental) => {
    setSelectedRental(rental);
    setIsDetailsModalOpen(true);
  };

  const handleOpenInvoice = (rental) => {
    setPendingReservationForInvoice(rental);
    setIsLangChoiceOpen(true);
  };

  const handleLanguageChosen = (selectedLang) => {
    setInvoiceLang(selectedLang);
    setSelectedRental(pendingReservationForInvoice);
    setIsLangChoiceOpen(false);
    setIsInvoiceModalOpen(true);
  };

  const handleOpenReview = (rental) => {
    setSelectedRental(rental);
    setIsReviewModalOpen(true);
  };

  // Quick Action: Send WhatsApp / SMS Reminder
  const handleSendReminder = (rental) => {
    const custPhone = (rental.user?.phone || '+94771234567').replace(/[^0-9]/g, '');
    const custName = rental.user?.name || rental.customerName || 'Customer';
    const toolName = rental.tool?.name || rental.toolName || 'Equipment Tool';
    const dueDate = formatDateClean(rental.endDate);
    
    const message = encodeURIComponent(`Hello ${custName}, this is a reminder from Lions Engineering regarding your rental of ${toolName}. Due Date for return: ${dueDate}. Please contact us if you need a hire extension.`);
    window.open(`https://wa.me/${custPhone}?text=${message}`, '_blank');
  };

  // Helper for Return Due Date countdown alert calculation
  const renderDueDateCountdown = (row) => {
    const st = (row.rentalStatus || row.status || '').toLowerCase();
    if (st === 'returned') {
      return <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Returned</span>;
    }
    if (!row.endDate) return <span className="text-slate-500 text-xs">N/A</span>;

    const today = new Date();
    const end = new Date(row.endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="text-[11px] text-rose-400 font-extrabold flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
          <AlertTriangle className="w-3 h-3" /> Overdue by {Math.abs(diffDays)} Day{Math.abs(diffDays) > 1 ? 's' : ''}
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="text-[11px] text-amber-400 font-extrabold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
          <Clock className="w-3 h-3" /> Due Today!
        </span>
      );
    }
    return (
      <span className="text-[11px] text-blue-400 font-bold flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
        <Clock className="w-3 h-3" /> Due in {diffDays} Day{diffDays > 1 ? 's' : ''}
      </span>
    );
  };

  const columns = [
    {
      header: 'Booking Code / ID',
      render: (row) => (
        <span className="font-mono text-amber-600 dark:text-amber-400 font-black text-xs">
          {row.reservationCode || `RNT-${(row.id || row._id || '').slice(-6).toUpperCase()}`}
        </span>
      )
    },
    {
      header: 'Customer Renter',
      render: (row) => (
        <div>
          <button
            onClick={() => handleViewCustomerDetails(row)}
            className="font-black text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 text-left transition-colors flex items-center gap-1 text-xs"
          >
            {row.user?.name || row.customerName || 'Customer'}
          </button>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">{row.user?.email || row.user?.phone || ''}</p>
        </div>
      )
    },
    {
      header: 'Tool Equipment',
      render: (row) => (
        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
          {row.tool?.name || row.toolName || 'Tool Equipment'}
        </span>
      )
    },
    // 1. Rental Duration Column
    {
      header: 'Rental Duration',
      render: (row) => {
        const start = new Date(row.startDate || Date.now());
        const end = new Date(row.endDate || Date.now() + 86400000 * 3);
        const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

        return (
          <div>
            <span className="font-extrabold text-amber-600 dark:text-amber-400 text-xs">{days} Day{days > 1 ? 's' : ''}</span>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium font-mono">{formatDateClean(row.startDate)} ~ {formatDateClean(row.endDate)}</p>
          </div>
        );
      }
    },
    // 1. Security Deposit Status Column
    {
      header: 'Deposit Status',
      render: (row) => {
        const st = (row.rentalStatus || row.status || '').toLowerCase();
        const depositAmt = row.tool?.depositAmount || 10000;

        if (st === 'returned') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-sm">
              <ShieldCheck className="w-3 h-3" /> Refunded ({formatLKR(depositAmt)})
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-sm">
            <ShieldCheck className="w-3 h-3" /> Deposit Paid ({formatLKR(depositAmt)})
          </span>
        );
      }
    },
    {
      header: 'Total Fee',
      render: (row) => (
        <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
          {formatLKR(row.totalPrice || row.totalEstimatedCost)}
        </span>
      )
    },
    {
      header: 'Rental Status',
      render: (row) => <StatusBadge status={row.rentalStatus || row.status || 'Pending'} />
    },
    // 2. Quick Actions: Return Item, Generate Invoice, Send Reminder
    {
      header: 'Quick Actions',
      render: (row) => {
        const st = (row.rentalStatus || row.status || '').toLowerCase();

        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Return Item Quick Action */}
            {!isCustomer && st !== 'returned' && (
              <button
                onClick={() => handleUpdateStatus(row.id || row._id, 'returned')}
                className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-black flex items-center gap-1 border border-emerald-500/30 transition-colors shadow-sm"
                title="Mark Equipment Returned"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Return Item
              </button>
            )}

            {/* Generate Invoice Quick Action */}
            {(st === 'approved' || st === 'active' || st === 'returned') && (
              <button
                onClick={() => handleOpenInvoice(row)}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-black flex items-center gap-1 border border-amber-500/30 transition-colors shadow-sm"
                title="Generate PDF Invoice"
              >
                <Printer className="w-3.5 h-3.5" /> Generate Invoice
              </button>
            )}

            {/* Send Reminder Quick Action */}
            {!isCustomer && st !== 'returned' && (
              <button
                onClick={() => handleSendReminder(row)}
                className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-black flex items-center gap-1 border border-blue-500/30 transition-colors shadow-sm"
                title="Send WhatsApp Due Date Reminder to Customer"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Send Reminder
              </button>
            )}

            {/* Rate Tool (Customer returned) */}
            {isCustomer && st === 'returned' && (
              <button
                onClick={() => handleOpenReview(row)}
                className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-black flex items-center gap-1 border border-purple-500/30 transition-colors shadow-sm"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Rate Tool
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header & Top Create CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100">
            {isCustomer ? 'My Rentals & Orders Live Dashboard' : 'Reservations & Rental Tracking'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isCustomer
              ? 'Track active equipment hires, return due date countdowns, download invoices, and leave reviews.'
              : 'Manage tool rentals, deposit statuses, return item workflows, and dispatch notifications.'}
          </p>
        </div>

        <Link
          to="/tools"
          className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Create New Rental Reservation
        </Link>
      </div>

      {/* 3. Enhanced Empty State UI with Direct Create CTA */}
      {rentals.length === 0 && !loading ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4 max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <CalendarCheck className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-100">No Rental Reservations Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isCustomer
                ? 'You do not have any active or past tool rental bookings yet. Browse our high-performance equipment catalog to place your first reservation.'
                : 'There are currently no customer rental reservations logged in the database.'}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black px-6 py-3 rounded-xl text-xs shadow-xl shadow-amber-500/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Create First Rental Reservation <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={rentals} />
      )}

      {/* Customer Dispatch Details Modal */}
      {selectedRental && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`Order Dispatch Info: ${selectedRental.tool?.name || selectedRental.toolName || 'Rental Tool'}`}
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-start">
              <div>
                <p className="text-amber-400 font-mono font-bold text-xs">
                  {selectedRental.reservationCode || `RNT-${(selectedRental.id || selectedRental._id || '').slice(-6).toUpperCase()}`}
                </p>
                <h4 className="font-extrabold text-slate-100 text-sm mt-0.5">{selectedRental.tool?.name || selectedRental.toolName}</h4>
                <p className="text-emerald-400 font-bold mt-1">Total Fee: {formatLKR(selectedRental.totalPrice || selectedRental.totalEstimatedCost)}</p>
              </div>
              <StatusBadge status={selectedRental.rentalStatus || selectedRental.status || 'Pending'} />
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <User className="w-3.5 h-3.5 text-amber-400" /> Customer Contact Profile
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <p><span className="text-slate-500">Name:</span> <strong className="text-slate-100">{selectedRental.user?.name || selectedRental.customerName || 'N/A'}</strong></p>
                <p className="flex items-center gap-1"><Mail className="w-3 h-3 text-amber-400" /> {selectedRental.user?.email || 'N/A'}</p>
                <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-400" /> {selectedRental.user?.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2">
              <h5 className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" /> Tool Delivery & Equipment Site Address
              </h5>
              {selectedRental.user?.address && (selectedRental.user.address.street || selectedRental.user.address.city) ? (
                <div className="text-slate-200 font-medium space-y-1">
                  <p className="font-bold text-slate-100">{selectedRental.user.address.street}</p>
                  <p>{selectedRental.user.address.city} {selectedRental.user.address.district ? `, ${selectedRental.user.address.district}` : ''}</p>
                  <p className="text-slate-400 font-mono text-[11px]">Postal Code: {selectedRental.user.address.postalCode || 'N/A'}</p>
                </div>
              ) : (
                <p className="text-slate-400 italic">No delivery address specified in customer account yet.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Interactive Bill Print Language Prompt Popup */}
      <PrintLanguageChoiceModal
        isOpen={isLangChoiceOpen}
        onClose={() => setIsLangChoiceOpen(false)}
        onSelectLanguage={handleLanguageChosen}
      />

      {/* PDF Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        rental={selectedRental}
        initialLanguage={invoiceLang}
      />

      {/* Tool Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        rental={selectedRental}
        onReviewSubmitted={() => fetchRentals()}
      />

      {/* Dual-Language Payment Checkout & POS Thermal Print Modal */}
      <PaymentCheckoutModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        rental={selectedRental}
        onPaymentSuccess={() => fetchRentals()}
      />
    </div>
  );
};
