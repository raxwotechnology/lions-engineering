import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Printer, Wrench, ShieldCheck, CheckCircle2, Phone, MapPin, Globe } from 'lucide-react';

export const InvoiceModal = ({ isOpen, onClose, rental, initialLanguage = 'en' }) => {
  const [language, setLanguage] = useState(initialLanguage); // 'en' | 'si'

  useEffect(() => {
    if (initialLanguage) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  const [companySettings, setCompanySettings] = useState({
    managerName: 'Amila Perera (Rental Manager)',
    whatsappNumber: '+94771234567',
    directPhone: '0112345678',
    noticeText: 'We deliver tools within 2 hours in Colombo area!'
  });

  useEffect(() => {
    fetch('/api/settings/support')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.settings) {
          setCompanySettings(data.settings);
        }
      })
      .catch(err => console.warn('Company settings fetch warning:', err));
  }, []);

  if (!rental) return null;

  // Direct Browser Printing (window.print())
  const handlePrint = () => {
    window.print();
  };

  const formatLKR = (val) => `Rs. ${Number(val || 0).toLocaleString('en-LK')}`;
  const bookingCode = rental.reservationCode || `RNT-${(rental.id || rental._id || '').slice(-6).toUpperCase()}`;
  const invoiceDate = new Date(rental.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Handle Multi-Item Billing Line Items Display
  const lineItems = rental.items && rental.items.length > 0
    ? rental.items
    : [{
        name: rental.tool?.name || rental.toolName || 'Industrial Equipment / Power Tool',
        code: rental.tool?.toolCode || 'TL-001',
        qty: rental.qty || 1,
        days: rental.days || 3,
        dailyRate: rental.tool?.pricePerDay || rental.dailyRate || 3500,
        total: rental.totalPrice || rental.totalEstimatedCost || 10500
      }];

  const grandTotal = rental.totalPrice || rental.totalEstimatedCost || lineItems.reduce((acc, item) => acc + (item.total || (item.qty * item.days * item.dailyRate)), 0);
  const depositAmount = rental.tool?.depositAmount || 10000;
  const subtotal = Math.max(0, grandTotal - depositAmount);

  const labels = {
    en: {
      officialTitle: "OFFICIAL RENTAL INVOICE",
      subtitle: "Official Industrial Equipment Rental Tax Receipt",
      address: "145 Industrial Zone Road, Colombo 05, Sri Lanka",
      hotline: "Hotline",
      whatsapp: "WhatsApp",
      manager: "Manager",
      regNo: "Reg No: PV-901284",
      paidBadge: "PAID INVOICE",
      invoiceNo: "Invoice #",
      dateIssued: "Date Issued",
      billedTo: "Billed To (Customer Details)",
      rentalInfo: "Rental Duration & Code",
      bookingRef: "Booking Ref",
      hirePeriod: "Hire Period",
      dispatchStatus: "Dispatch Status",
      activeDispatched: "Active / Dispatched",
      billedEquipment: "Billed Equipment Items",
      colItem: "Item Name & Serial Code",
      colQty: "Qty",
      colDuration: "Duration",
      colDailyRate: "Daily Rate",
      colLineTotal: "Line Total (LKR)",
      rentalFee: "Equipment Rental Fee",
      securityDeposit: "Security Deposit",
      totalPaid: "Total Paid (LKR)",
      verifiedStamp: "Official Verified Digital Stamp",
      closeBtn: "Close",
      printBtn: "Direct Print Receipt (window.print)"
    },
    si: {
      officialTitle: "නිල බිල්පත් රිසිට්පත",
      subtitle: "ලයන්ස් ඉංජිනේරුවෝ - නිල උපකරණ කුලියට දීමේ බිල්පත",
      address: "නො. 145, කාර්මික කලාප පාර, කොළඹ 05, ශ්‍රී ලංකාව",
      hotline: "දුරකථන",
      whatsapp: "වට්ස්ඇප්",
      manager: "ක කළමනාකරු",
      regNo: "ලියාපදිංචි අංකය: PV-901284",
      paidBadge: "ගෙවන ලද බිල්පත (PAID)",
      invoiceNo: "බිල්පත් අංකය",
      dateIssued: "නිකුත් කළ දිනය",
      billedTo: "පාරිභෝගික තොරතුරු (Billed To)",
      rentalInfo: "කුලී කාලසීමාව සහ කේතය",
      bookingRef: "වෙන්කිරීමේ අංකය",
      hirePeriod: "කුලී කාලය",
      dispatchStatus: "නිකුත් කිරීමේ තත්ත්වය",
      activeDispatched: "සක්‍රීයයි / භාරදෙන ලදී",
      billedEquipment: "කුලියට ගත් උපකරණ ලැයිස්තුව",
      colItem: "උපකරණයේ නම සහ ලියාපදිංචි කේතය",
      colQty: "ප්‍රමාණය",
      colDuration: "කාලසීමාව",
      colDailyRate: "දෛනික ගාස්තුව",
      colLineTotal: "මුළු ගාස්තුව (රු.)",
      rentalFee: "උපකරණ කුලී ගාස්තුව",
      securityDeposit: "ඇප මුදල (Security Deposit)",
      totalPaid: "ගෙවූ මුළු මුදල (LKR)",
      verifiedStamp: "නිල සහතික ලත් ඩිජිටල් මුද්‍රාව",
      closeBtn: "වසා දමන්න",
      printBtn: "බිල්පත මුද්‍රණය කරන්න (Print Receipt)"
    }
  };

  const currentLabel = labels[language];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${currentLabel.officialTitle} - ${bookingCode}`}>
      <div className="space-y-6 text-slate-900 bg-white p-6 rounded-2xl print:p-0 print:shadow-none print:bg-white" id="printable-invoice">
        
        {/* DUAL LANGUAGE TOGGLE BAR */}
        <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl border border-slate-200 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Globe className="w-4 h-4 text-amber-500" />
            <span>Bill Language / බිල්පත් භාෂාව:</span>
          </div>
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm text-xs font-bold">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-md transition-all ${language === 'en' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('si')}
              className={`px-3 py-1 rounded-md transition-all font-sinhala ${language === 'si' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              සිංහල
            </button>
          </div>
        </div>

        {/* Dynamic Company Branding Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-sm overflow-hidden shrink-0">
                {companySettings.companyLogoUrl ? (
                  <img src={companySettings.companyLogoUrl} alt="Company Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <Wrench className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>
              <div>
                <h2 className="font-black text-lg text-slate-900 tracking-tight">LIONS ENGINEERING & TOOL RENTALS</h2>
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider font-sinhala">{currentLabel.subtitle}</p>
              </div>
            </div>
            <div className="text-[11px] text-slate-600 mt-2 space-y-0.5 font-sinhala">
              <p className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {currentLabel.address}</p>
              <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {currentLabel.hotline}: {companySettings.directPhone || '0112345678'} | {currentLabel.whatsapp}: {companySettings.whatsappNumber || '+94771234567'}</p>
              <p className="text-[10px] text-slate-400 font-mono">{currentLabel.regNo} | {currentLabel.manager}: {companySettings.managerName}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs font-sinhala">
              {currentLabel.paidBadge}
            </span>
            <p className="text-xs font-mono font-bold text-slate-800 mt-2">{currentLabel.invoiceNo}: INV-{bookingCode}</p>
            <p className="text-[11px] text-slate-500">{currentLabel.dateIssued}: {invoiceDate}</p>
          </div>
        </div>

        {/* Customer & Agreement Info */}
        <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 font-sinhala">{currentLabel.billedTo}</p>
            <p className="font-bold text-slate-900 mt-0.5">{rental.user?.name || rental.customerName || 'Valued Customer'}</p>
            <p className="text-slate-600">{rental.user?.phone || 'Contact: Included in Account'}</p>
            <p className="text-slate-600">{rental.user?.email || ''}</p>
            {rental.user?.address?.street && (
              <p className="text-slate-600 text-[11px] mt-1 font-medium">
                Site Address: {rental.user.address.street}, {rental.user.address.city}, {rental.user.address.district}
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400 font-sinhala">{currentLabel.rentalInfo}</p>
            <p className="font-bold text-slate-900 mt-0.5">{currentLabel.bookingRef}: <span className="font-mono text-amber-600">{bookingCode}</span></p>
            <p className="text-slate-600">{currentLabel.hirePeriod}: {new Date(rental.startDate).toLocaleDateString()} to {new Date(rental.endDate).toLocaleDateString()}</p>
            <p className="text-slate-600">{currentLabel.dispatchStatus}: <span className="font-bold text-emerald-600 uppercase font-sinhala">{currentLabel.activeDispatched}</span></p>
          </div>
        </div>

        {/* Multi-Item Line Items Table */}
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 font-sinhala">{currentLabel.billedEquipment}</p>
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-y border-slate-200 font-sinhala">
                <th className="py-2.5 px-3">{currentLabel.colItem}</th>
                <th className="py-2.5 px-3 text-center">{currentLabel.colQty}</th>
                <th className="py-2.5 px-3 text-center">{currentLabel.colDuration}</th>
                <th className="py-2.5 px-3 text-right">{currentLabel.colDailyRate}</th>
                <th className="py-2.5 px-3 text-right">{currentLabel.colLineTotal}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {lineItems.map((item, idx) => {
                const itemName = item.name || item.toolName || rental.tool?.name || 'Industrial Equipment';
                const itemCode = item.code || item.toolCode || rental.tool?.toolCode || `TL-00${idx + 1}`;
                const qty = item.qty || rental.qty || 1;
                const days = item.days || rental.days || 3;
                const rate = item.dailyRate || rental.tool?.pricePerDay || 3500;
                const lineTotal = item.total || (qty * days * rate);

                return (
                  <tr key={idx}>
                    <td className="py-3 px-3">
                      <p className="font-extrabold text-slate-900">{itemName}</p>
                      <p className="text-[10px] text-amber-700 font-mono font-bold">Registration Code: {itemCode}</p>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">{qty}</td>
                    <td className="py-3 px-3 text-center font-mono">{days} {language === 'si' ? 'දින' : 'Day(s)'}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatLKR(rate)}</td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-900">{formatLKR(lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Financial Summary Breakdown */}
        <div className="flex justify-between items-end border-t border-slate-200 pt-4">
          <div className="text-[11px] text-slate-500 space-y-1">
            <p className="flex items-center gap-1 font-semibold text-emerald-700 font-sinhala">
              <ShieldCheck className="w-3.5 h-3.5" /> {currentLabel.verifiedStamp}
            </p>
            <p>{companySettings.noticeText || 'We deliver tools within 2 hours in Colombo area!'}</p>
          </div>

          <div className="text-right space-y-1 text-xs min-w-[220px]">
            <div className="flex justify-between text-slate-600 font-sinhala">
              <span>{currentLabel.rentalFee}:</span>
              <span className="font-mono font-bold">{formatLKR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-sinhala">
              <span>{currentLabel.securityDeposit}:</span>
              <span className="font-mono font-bold">{formatLKR(depositAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-300 pt-1.5 mt-1 font-sinhala">
              <span>{currentLabel.totalPaid}:</span>
              <span className="text-emerald-700 font-mono">{formatLKR(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl text-xs font-sinhala"
          >
            {currentLabel.closeBtn}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 font-sinhala"
          >
            <Printer className="w-4 h-4" /> {currentLabel.printBtn}
          </button>
        </div>
      </div>
    </Modal>
  );
};
