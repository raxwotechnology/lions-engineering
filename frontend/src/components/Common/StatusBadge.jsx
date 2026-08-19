import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || 'Pending').toLowerCase().trim();

  const getStyle = () => {
    switch (normalized) {
      case 'available':
      case 'active':
      case 'approved':
      case 'paid':
      case 'returned':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-extrabold';

      case 'rented':
      case 'pending':
      case 'requested':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-extrabold';

      case 'sent':
      case 'rental issue':
      case 'partially paid':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-extrabold';

      case 'maintenance':
      case 'rejected':
      case 'cancelled':
      case 'blacklisted':
      case 'unpaid':
      case 'overdue':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-extrabold';

      case 'refunded':
      case 'rental return':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-extrabold';

      default:
        return 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 font-bold';
    }
  };

  const displayLabel = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : 'Pending';

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border shadow-sm ${getStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {displayLabel}
    </span>
  );
};
