import React from 'react';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <p>© 2026 Tool Rental Management System. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Phase 1 Architecture Ready
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] text-slate-400">MERN Stack Modular Layout</span>
        </div>
      </div>
    </footer>
  );
};
