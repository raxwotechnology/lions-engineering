import React from 'react';

export const MetricCard = ({ title, value, change, icon: Icon, color = 'amber' }) => {
  const colorMap = {
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{value}</h3>
          {change && (
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>{change}</span> <span className="text-slate-400 font-medium text-[10px]">vs last month</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-2xl border ${colorMap[color] || colorMap.amber} shrink-0`}>
            <Icon className="w-6 h-6 stroke-[2.5]" />
          </div>
        )}
      </div>
    </div>
  );
};
