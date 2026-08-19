import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, Megaphone, Clock, Headphones } from 'lucide-react';

export const SupportWidget = () => {
  const [support, setSupport] = useState({
    supportManagerName: 'Mr. Amila Perera - Rental Manager',
    whatsappNumber: '+94771234567',
    directPhone: '0112345678',
    announcementNotice: 'We deliver tools within 2 hours across Colombo & Gampaha districts!',
    workingHours: '8:00 AM - 7:00 PM (Mon - Sat)'
  });

  useEffect(() => {
    fetch('/api/settings/support')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.support) {
          setSupport(data.support);
        }
      })
      .catch(err => console.warn('Dynamic support fetch error:', err));
  }, []);

  const cleanWhatsapp = (support.whatsappNumber || '+94771234567').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=Hello%2C%20I%20have%20an%20inquiry%20regarding%20tool%20rentals.`;

  return (
    <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-slate-900/90 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <MessageCircle className="w-6 h-6 stroke-[2.2] text-slate-950" />
            </div>
            <span className="w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full absolute -bottom-0.5 -right-0.5 animate-pulse"></span>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
              {support.supportManagerName}
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold">
                Online Support
              </span>
            </h4>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-amber-400" /> {support.workingHours}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <MessageCircle className="w-4 h-4 stroke-[2.5]" /> Chat on WhatsApp
          </a>
          <a
            href={`tel:${support.directPhone}`}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-all"
          >
            <Phone className="w-4 h-4" /> Call Hotline
          </a>
        </div>
      </div>

      {support.announcementNotice && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2.5">
          <Megaphone className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{support.announcementNotice}</span>
        </div>
      )}
    </div>
  );
};
