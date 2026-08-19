import React from 'react';
import { Modal } from './Modal';
import { Globe, Printer, FileText, Sparkles, Check } from 'lucide-react';

export const PrintLanguageChoiceModal = ({ isOpen, onClose, onSelectLanguage, title = "Select Bill Language / බිල්පත් භාෂාව තෝරන්න" }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6 text-slate-900 dark:text-slate-100 p-2">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
            <Globe className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-tight">Choose Invoice Language</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            කරුණාකර ඔබට බිල්පත මුද්‍රණය කිරීමට අවශ්‍ය භාෂාව තෝරන්න.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: English */}
          <button
            type="button"
            onClick={() => onSelectLanguage('en')}
            className="group p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500 bg-slate-50 dark:bg-slate-950 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🇬🇧</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                English PDF
              </span>
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                English Invoice
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Standard English tax receipt with item codes & totals.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-amber-600 dark:text-amber-400">
              <Printer className="w-3.5 h-3.5 mr-1" /> Print in English →
            </div>
          </button>

          {/* Option 2: Sinhala */}
          <button
            type="button"
            onClick={() => onSelectLanguage('si')}
            className="group p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500 bg-slate-50 dark:bg-slate-950 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🇱🇰</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                සිංහල PDF
              </span>
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors font-sinhala">
                සිංහල බිල්පත
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-sinhala">
                සිංහල යුනිකෝඩ් අකුරෙන් මුද්‍රණය වන නිල බිල්පත් රිසිට්පත.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-amber-600 dark:text-amber-400 font-sinhala">
              <Printer className="w-3.5 h-3.5 mr-1" /> සිංහලෙන් මුද්‍රණය කරන්න →
            </div>
          </button>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Cancel / අවලංගු කරන්න
          </button>
        </div>
      </div>
    </Modal>
  );
};
