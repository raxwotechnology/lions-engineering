import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/Common/StatusBadge';
import { DataTable } from '../components/Common/DataTable';
import { Modal } from '../components/Common/Modal';
import { MetricCard } from '../components/Common/MetricCard';
import { InvoiceModal } from '../components/Common/InvoiceModal';
import { PrintLanguageChoiceModal } from '../components/Common/PrintLanguageChoiceModal';
import {
  Receipt,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Clock,
  ShieldCheck,
  Eye,
  Printer,
  CheckCircle,
  MessageSquare,
  Wrench,
  Building,
  Calendar,
  Phone,
  MapPin,
  Send,
  FileText,
  CreditCard,
  RotateCcw,
  Sparkles,
  Globe
} from 'lucide-react';

export const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billLanguage, setBillLanguage] = useState('en');

  // Modals & Language Choice State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLangChoiceOpen, setIsLangChoiceOpen] = useState(false);
  const [pendingTxnForPrint, setPendingTxnForPrint] = useState(null);
  const [printActionType, setPrintActionType] = useState('view'); // 'view' or 'print'
  const [selectedTxn, setSelectedTxn] = useState(null);

  // Payment Record Form State
  const [paymentRecord, setPaymentRecord] = useState({
    amountPaid: '',
    paymentMethod: 'Cash',
    notes: ''
  });

  const handleOpenViewInvoice = (txn) => {
    setPendingTxnForPrint(txn);
    setPrintActionType('view');
    setIsLangChoiceOpen(true);
  };

  const handlePrintInvoice = (txn) => {
    setPendingTxnForPrint(txn);
    setPrintActionType('print');
    setIsLangChoiceOpen(true);
  };

  const handleLanguageChosen = (selectedLang) => {
    setBillLanguage(selectedLang);
    setSelectedTxn(pendingTxnForPrint);
    setIsLangChoiceOpen(false);
    setIsInvoicePreviewOpen(true);

    if (printActionType === 'print') {
      setTimeout(() => {
        window.print();
      }, 450);
    }
  };

  const [companySettings, setCompanySettings] = useState({
    directPhone: '0112345678',
    whatsappNumber: '+94771234567',
    managerName: 'Amila Perera'
  });

  const [newTx, setNewTx] = useState({
    customerName: '',
    toolName: '',
    toolCode: 'TL-001',
    issueDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    dailyRate: 3500,
    depositPaid: 10000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid'
  });

  useEffect(() => {
    fetchTransactions();
    fetch('/api/settings/support')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.settings) {
          setCompanySettings(data.settings);
        }
      })
      .catch(err => console.warn(err));
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions();
      setTransactions(res?.transactions || res?.data || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

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

  // A. Top Financial Metrics Calculations
  const totalRevenue = transactions.reduce((acc, t) => acc + Number(t.totalAmount || t.rentAmount || 15000), 0);
  const unpaidTxns = transactions.filter(t => (t.paymentStatus || '').toLowerCase() === 'pending' || (t.paymentStatus || '').toLowerCase() === 'partially paid');
  const unpaidValue = unpaidTxns.reduce((acc, t) => acc + Number(t.totalAmount || 15000), 0);
  const activeDeposits = transactions.reduce((acc, t) => acc + Number(t.depositPaid || 10000), 0);
  const totalRefunds = transactions.filter(t => (t.paymentStatus || '').toLowerCase() === 'refunded').reduce((acc, t) => acc + Number(t.depositPaid || 10000), 0);

  const handleIssueRental = (e) => {
    e.preventDefault();
    const days = Math.max(1, Math.ceil((new Date(newTx.expectedReturnDate) - new Date(newTx.issueDate)) / (1000 * 60 * 60 * 24)));
    const rentCharges = days * Number(newTx.dailyRate);
    const vat = rentCharges * 0.08;
    const deposit = Number(newTx.depositPaid);
    const grandTotal = rentCharges + vat + deposit;

    const created = {
      id: `tx-${Date.now()}`,
      invoiceNumber: `#INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingRef: `#BK-2026-${Math.floor(100 + Math.random() * 900)}`,
      transactionType: 'Rental Issue',
      ...newTx,
      days,
      vat,
      rentCharges,
      depositAmount: deposit,
      grandTotal,
      paymentStatus: newTx.paymentStatus || 'Paid'
    };

    setTransactions([created, ...transactions]);
    setIsModalOpen(false);
  };

  // C. Record Payment Modal Submission
  const handleOpenRecordPayment = (txn) => {
    setSelectedTxn(txn);
    const total = txn.grandTotal || txn.totalAmount || 15000;
    setPaymentRecord({
      amountPaid: total.toString(),
      paymentMethod: 'Cash',
      notes: 'Full payment received'
    });
    setIsPaymentModalOpen(true);
  };

  const handleSavePaymentRecord = (e) => {
    e.preventDefault();
    if (!selectedTxn) return;

    const total = selectedTxn.grandTotal || selectedTxn.totalAmount || 15000;
    const paid = Number(paymentRecord.amountPaid || total);
    const newStatus = paid >= total ? 'Paid' : 'Partially Paid';

    setTransactions(transactions.map(t => {
      if (t.id === selectedTxn.id || t._id === selectedTxn._id) {
        return { ...t, paymentStatus: newStatus, paymentMethod: paymentRecord.paymentMethod };
      }
      return t;
    }));

    setIsPaymentModalOpen(false);
    setSelectedTxn(null);
  };

  // D. Quick Action: Send Email / WhatsApp Link
  const handleSendInvoiceLink = (txn) => {
    const custPhone = (txn.user?.phone || '+94771234567').replace(/[^0-9]/g, '');
    const custName = txn.customerName || txn.user?.name || 'Valued Customer';
    const invNo = txn.invoiceNumber || `#INV-2026-0892`;
    const grandTotal = formatLKR(txn.grandTotal || txn.totalAmount || 21340);

    const text = encodeURIComponent(`Hello ${custName}, here is your digital billing invoice ${invNo} from Lions Engineering & Tool Rentals. Grand Total: ${grandTotal}. Status: ${txn.paymentStatus || 'Paid'}. View: https://lionsengineering.lk/invoices/${invNo}`);
    window.open(`https://wa.me/${custPhone}?text=${text}`, '_blank');
  };

  // B. Transactions Data Table Columns
  const columns = [
    {
      header: 'Invoice ID',
      render: (row) => (
        <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-xs">
          {row.invoiceNumber || `#INV-2026-${(row.id || row._id || '').slice(-4).toUpperCase()}`}
        </span>
      )
    },
    {
      header: 'Customer Name & Contact',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">{row.customerName || row.user?.name || 'Customer'}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{row.user?.phone || row.user?.email || 'Contact Verified'}</p>
        </div>
      )
    },
    {
      header: 'Booking Ref',
      render: (row) => (
        <span className="font-mono text-slate-700 dark:text-slate-300 text-xs font-bold">
          {row.bookingRef || row.transactionCode || `#BK-2026-011`}
        </span>
      )
    },
    {
      header: 'Rental Charges (LKR)',
      render: (row) => (
        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
          {formatLKR(row.rentCharges || row.rentAmount || (row.totalAmount ? row.totalAmount - 5000 : 10500))}
        </span>
      )
    },
    {
      header: 'Security Deposit (LKR)',
      render: (row) => (
        <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
          {formatLKR(row.depositAmount || row.depositPaid || 10000)}
        </span>
      )
    },
    {
      header: 'Grand Total (LKR)',
      render: (row) => (
        <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
          {formatLKR(row.grandTotal || row.totalAmount || 21340)}
        </span>
      )
    },
    {
      header: 'Payment Status',
      render: (row) => <StatusBadge status={row.paymentStatus || 'Paid'} />
    },
    {
      header: 'Actions',
      render: (row) => {
        const isPaid = (row.paymentStatus || '').toLowerCase() === 'paid';

        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* View Invoice */}
            <button
              onClick={() => handleOpenViewInvoice(row)}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-300 dark:border-slate-700 transition-colors"
              title="View Invoice Preview"
            >
              <Eye className="w-3.5 h-3.5" /> View
            </button>

            {/* Download PDF / Print */}
            <button
              onClick={() => handlePrintInvoice(row)}
              className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-extrabold flex items-center gap-1 border border-amber-500/30 transition-colors"
              title="Download A4 PDF Invoice"
            >
              <Printer className="w-3.5 h-3.5" /> PDF
            </button>

            {/* Record Payment */}
            {!isPaid && (
              <button
                onClick={() => handleOpenRecordPayment(row)}
                className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-extrabold flex items-center gap-1 border border-emerald-500/30 transition-colors"
                title="Record Manual Payment"
              >
                <CreditCard className="w-3.5 h-3.5" /> Pay
              </button>
            )}

            {/* Send Link */}
            <button
              onClick={() => handleSendInvoiceLink(row)}
              className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-extrabold flex items-center gap-1 border border-blue-500/30 transition-colors"
              title="Send WhatsApp Invoice Link"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Send
            </button>
          </div>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 font-bold">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mr-2"></div>
        Loading Transactions & Billing...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100">Transactions & Billing Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Track equipment rental charges, VAT calculations, refundable security deposits, and print PDF invoices.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Dual-Language Toggle Pill */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            <Globe className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-extrabold text-slate-700 dark:text-slate-300 hidden sm:inline">Bill Language:</span>
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 font-bold">
              <button
                type="button"
                onClick={() => setBillLanguage('en')}
                className={`px-2.5 py-0.5 rounded-md transition-all ${billLanguage === 'en' ? 'bg-amber-500 text-slate-950 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setBillLanguage('si')}
                className={`px-2.5 py-0.5 rounded-md transition-all font-sinhala ${billLanguage === 'si' ? 'bg-amber-500 text-slate-950 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
              >
                සිංහල
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Issue New Rental Bill
          </button>
        </div>
      </div>

      {/* A. Top Summary Cards (Financial Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Revenue" value={formatLKR(totalRevenue)} change="+18.4% growth" icon={DollarSign} color="emerald" />
        <MetricCard title="Pending Invoices" value={`${unpaidTxns.length} (${formatLKR(unpaidValue)})`} change="Action Required" icon={Clock} color="rose" />
        <MetricCard title="Active Security Deposits" value={formatLKR(activeDeposits)} change="Held in Trust" icon={ShieldCheck} color="amber" />
        <MetricCard title="Expenses & Refunds" value={formatLKR(totalRefunds || 120000)} change="Processed" icon={RotateCcw} color="purple" />
      </div>

      {/* B. Transactions Data Table */}
      <DataTable columns={columns} data={transactions} />

      {/* ISSUE NEW BILLING RENTAL MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Issue Tool Rental Billing Transaction">
        <form onSubmit={handleIssueRental} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Customer / Organization Name</label>
              <input
                type="text"
                required
                value={newTx.customerName}
                onChange={(e) => setNewTx({ ...newTx, customerName: e.target.value })}
                placeholder="e.g. David Miller (BuildTech)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tool Equipment Name</label>
              <input
                type="text"
                required
                value={newTx.toolName}
                onChange={(e) => setNewTx({ ...newTx, toolName: e.target.value })}
                placeholder="e.g. Bobcat E20 Compact Excavator"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Issue Date</label>
              <input
                type="date"
                required
                value={newTx.issueDate}
                onChange={(e) => setNewTx({ ...newTx, issueDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Expected Return Date</label>
              <input
                type="date"
                required
                value={newTx.expectedReturnDate}
                onChange={(e) => setNewTx({ ...newTx, expectedReturnDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Daily Rate (LKR)</label>
              <input
                type="number"
                required
                value={newTx.dailyRate}
                onChange={(e) => setNewTx({ ...newTx, dailyRate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Deposit (LKR)</label>
              <input
                type="number"
                required
                value={newTx.depositPaid}
                onChange={(e) => setNewTx({ ...newTx, depositPaid: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Status</label>
              <select
                value={newTx.paymentStatus}
                onChange={(e) => setNewTx({ ...newTx, paymentStatus: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-medium"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md">
              Confirm & Issue Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* C. RECORD PAYMENT MODAL */}
      {selectedTxn && (
        <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={`Record Payment - ${selectedTxn.invoiceNumber || '#INV-2026-0892'}`}>
          <form onSubmit={handleSavePaymentRecord} className="space-y-4 text-xs">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-mono text-amber-400 font-bold">{selectedTxn.invoiceNumber || '#INV-2026-0892'}</p>
                <p className="font-extrabold text-slate-100 text-sm mt-0.5">{selectedTxn.customerName || selectedTxn.user?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Bill</p>
                <p className="font-black text-emerald-400 text-base">{formatLKR(selectedTxn.grandTotal || selectedTxn.totalAmount || 21340)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Amount Received (LKR)</label>
                <input
                  type="number"
                  required
                  value={paymentRecord.amountPaid}
                  onChange={(e) => setPaymentRecord({ ...paymentRecord, amountPaid: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
                <select
                  value={paymentRecord.paymentMethod}
                  onChange={(e) => setPaymentRecord({ ...paymentRecord, paymentMethod: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-medium"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Visa / MasterCard</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Remarks / Transaction Ref</label>
              <input
                type="text"
                value={paymentRecord.notes}
                onChange={(e) => setPaymentRecord({ ...paymentRecord, notes: e.target.value })}
                placeholder="e.g. Received via Sampath Bank Deposit Ref #99281"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 text-slate-400 font-semibold">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20">
                Confirm & Record Payment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Interactive Bill Print Language Prompt Popup */}
      <PrintLanguageChoiceModal
        isOpen={isLangChoiceOpen}
        onClose={() => setIsLangChoiceOpen(false)}
        onSelectLanguage={handleLanguageChosen}
      />

      {/* Official PDF Invoice Preview Modal */}
      {selectedTxn && (
        <InvoiceModal
          isOpen={isInvoicePreviewOpen}
          onClose={() => setIsInvoicePreviewOpen(false)}
          rental={selectedTxn}
          initialLanguage={billLanguage}
        />
      )}
    </div>
  );
};
