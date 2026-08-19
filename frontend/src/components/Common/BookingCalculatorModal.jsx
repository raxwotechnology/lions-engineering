import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Calendar, DollarSign, ShieldAlert, CheckCircle2, Clock, Calculator, ArrowRight } from 'lucide-react';

export const BookingCalculatorModal = ({ isOpen, onClose, tool, onBookingSuccess }) => {
  const today = new Date().toISOString().split('T')[0];
  const next3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(next3Days);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const pricePerDay = tool?.pricePerDay || 2500;
  const securityDeposit = tool?.securityDeposit || 5000;

  // Calculate rental duration & total price
  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  };

  const numDays = calculateDays();
  const rentalSubtotal = numDays * pricePerDay;
  const grandTotal = rentalSubtotal + securityDeposit;

  const formatLKR = (amount) => `Rs. ${Number(amount || 0).toLocaleString()}`;

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          tool: tool?.id || tool?._id,
          toolId: tool?.id || tool?._id,
          toolName: tool?.name,
          startDate,
          endDate,
          totalPrice: grandTotal,
          numDays,
          dailyRate: pricePerDay,
          securityDeposit
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (onBookingSuccess) onBookingSuccess(data.rental);
        onClose();
      } else {
        setErrorMsg(data.message || 'Failed to place rental request.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Server error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!tool) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Rent Equipment: ${tool.name}`}>
      <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Selected Tool Summary Header */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-slate-100 text-sm">{tool.name}</h4>
            <p className="text-slate-400 text-[11px] mt-0.5">{tool.brand || 'Industrial Grade'} • Category: {tool.categoryName || 'Power Tools'}</p>
          </div>
          <div className="text-right">
            <span className="text-amber-400 font-black text-sm block">{formatLKR(pricePerDay)}</span>
            <span className="text-slate-500 text-[10px] uppercase font-bold">Per Day Rate</span>
          </div>
        </div>

        {/* Start & End Date Pickers */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Start Date
            </label>
            <input
              type="date"
              required
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Return Date
            </label>
            <input
              type="date"
              required
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Rental Duration Banner */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Rental Duration: {numDays} Day{numDays > 1 ? 's' : ''}</span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">{startDate} to {endDate}</span>
        </div>

        {/* Transparent Interactive Price Breakdown Table */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
          <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <Calculator className="w-3.5 h-3.5 text-amber-400" /> Transparent Rental Cost Calculation
          </h5>

          <div className="space-y-1.5 pt-1 text-slate-300">
            <div className="flex justify-between">
              <span>Daily Rate × {numDays} Day{numDays > 1 ? 's' : ''}</span>
              <span className="font-mono font-semibold">{formatLKR(pricePerDay)} × {numDays} = {formatLKR(rentalSubtotal)}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-blue-400" /> Refundable Security Deposit
              </span>
              <span className="font-mono font-semibold text-slate-300">{formatLKR(securityDeposit)}</span>
            </div>

            <div className="border-t border-slate-800/80 pt-2 flex justify-between items-center text-sm">
              <span className="font-black text-slate-100">Estimated Total (LKR)</span>
              <span className="font-black text-emerald-400 text-base">{formatLKR(grandTotal)}</span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 italic">
          * Refundable security deposit will be fully credited back upon inspection & tool return.
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-slate-400 font-semibold hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {loading ? 'CONFIRMING...' : 'CONFIRM & SUBMIT RENTAL BOOKING'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </Modal>
  );
};
