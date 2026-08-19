import React, { useState } from 'react';
import { Modal } from './Modal';
import { Star, MessageSquare, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ReviewModal = ({ isOpen, onClose, rental, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [equipmentCondition, setEquipmentCondition] = useState('Excellent');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!rental) return null;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          toolId: rental.tool?.id || rental.tool?._id || rental.tool,
          rating,
          comment,
          equipmentCondition
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (onReviewSubmitted) onReviewSubmitted(data.review);
        onClose();
      } else {
        setErrorMsg(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Server error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Rate & Review Equipment: ${rental.tool?.name || rental.toolName || 'Tool'}`}>
      <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl font-bold text-center">
            {errorMsg}
          </div>
        )}

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <h4 className="font-extrabold text-slate-100 text-sm">{rental.tool?.name || rental.toolName}</h4>
          <p className="text-slate-400 text-xs">Completed Rental Booking: {rental.reservationCode || `RNT-${(rental.id || rental._id || '').slice(-6).toUpperCase()}`}</p>
        </div>

        {/* Star Rating Picker */}
        <div>
          <label className="block text-slate-300 font-semibold mb-2 text-center uppercase tracking-wider text-[11px]">
            Overall Equipment Rating
          </label>
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center font-bold text-amber-400 mt-1">{rating} out of 5 Stars</p>
        </div>

        {/* Equipment Condition Selector */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Equipment Physical Condition</label>
          <select
            value={equipmentCondition}
            onChange={(e) => setEquipmentCondition(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50"
          >
            <option value="Excellent">Excellent - Flawless Operation</option>
            <option value="Good">Good - Expected Wear</option>
            <option value="Fair">Fair - Operates Ok</option>
            <option value="Needs Maintenance">Needs Maintenance / Servicing</option>
          </select>
        </div>

        {/* Review Comment */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Detailed Review & Performance Comments</label>
          <textarea
            rows={3}
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience using this tool, performance efficiency, battery life, or overall reliability..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50"
          ></textarea>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-400 font-semibold hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20"
          >
            {loading ? 'Submitting...' : 'Submit Equipment Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
