import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Printer, CreditCard, DollarSign, Languages, CheckCircle2, Wrench, ShieldCheck, Phone, MapPin } from 'lucide-react';

export const PaymentCheckoutModal = ({ isOpen, onClose, rental, onPaymentSuccess }) => {
  const [language, setLanguage] = useState('en'); // 'en' or 'si'
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Cash, Card, Bank Transfer
  const [paidAmount, setPaidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [companySettings, setCompanySettings] = useState({
    directPhone: '0112345678',
    whatsappNumber: '+94771234567',
    managerName: 'Amila Perera'
  });

  useEffect(() => {
    fetch('/api/settings/support')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.settings) {
          setCompanySettings(data.settings);
        }
      })
      .catch(err => console.warn(err));
  }, []);

  if (!rental) return null;

  const grandTotal = rental.totalPrice || rental.totalEstimatedCost || 10500;
  const depositAmount = rental.tool?.depositAmount || 10000;
  const numericPaid = Number(paidAmount || grandTotal);
  const balance = Math.max(0, numericPaid - grandTotal);
  const bookingCode = rental.reservationCode || `RNT-${(rental.id || rental._id || '').slice(-6).toUpperCase()}`;

  // Dual-Language Headings & Labels Dictionary
  const dict = {
    en: {
      title: 'Bill Payment & POS Checkout Modal',
      receiptHeader: 'OFFICIAL RECEIPT / INVOICE',
      companyTitle: 'LIONS ENGINEERING & TOOL RENTALS',
      companySub: '145 Industrial Zone Road, Colombo 05, Sri Lanka',
      billNo: 'Bill No',
      date: 'Date',
      custLabel: 'Customer Details',
      custNameLabel: 'Customer Name',
      custPhoneLabel: 'Phone Number',
      custName: rental.user?.name || rental.customerName || 'Valued Customer',
      custPhone: rental.user?.phone || 'Contact: Profile Verified',
      hirePeriod: 'Rental Period',
      toolDescLabel: 'Tool Description',
      serialCode: 'Registration Serial Code',
      qty: 'Qty',
      durationLabel: 'Duration',
      dailyRateLabel: 'Daily Rate',
      depositLabel: 'Security Deposit',
      totalLabel: 'Total',
      paidLabel: 'Paid Amount',
      balanceLabel: 'Balance',
      paymentMethod: 'Payment Mode',
      paymentStatus: 'Payment Status',
      statusPaid: 'PAID IN FULL',
      statusPartial: 'PARTIALLY PAID',
      thankYou: 'Thank you for choosing Lions Engineering & Tool Rentals!',
      depositDisclaimer: 'Please bring this receipt for security deposit refunds.',
      printBtn: 'Print Receipt (window.print)',
      savePaymentBtn: 'Confirm Payment & Print Receipt',
      langSelect: 'Bill Language:'
    },
    si: {
      title: 'ගෙවීම් සහ බිල්පත් නිකුත් කිරීමේ මොඩියුලය',
      receiptHeader: 'රිසිට්පත / බිල්පත',
      companyTitle: 'ලයන්ස් ඉංජිනියරින් සහ ටූල් රෙන්ටල්ස්',
      companySub: 'නො. 145 ඉන්ඩස්ට්‍රියල් ෂෝන් පාර, කොළඹ 05, ශ්‍රී ලංකාව',
      billNo: 'බිල් අංකය',
      date: 'දිනය',
      custLabel: 'පාරිභෝගික විස්තර',
      custNameLabel: 'පාරිභෝගිකයාගේ නම',
      custPhoneLabel: 'දුරකථන අංකය',
      custName: rental.user?.name || rental.customerName || 'පාරිභෝගිකයා',
      custPhone: rental.user?.phone || 'දුරකථන අංකය',
      hirePeriod: 'කුලී කාලසීමාව',
      toolDescLabel: 'උපකරණ විස්තරය',
      serialCode: 'ලියාපදිංචි අංකය',
      qty: 'ප්‍රමාණය',
      durationLabel: 'කාලසීමාව',
      dailyRateLabel: 'දෛනික ගාස්තුව',
      depositLabel: 'ඇප මුදල',
      totalLabel: 'මුළු එකතුව',
      paidLabel: 'ගෙවූ මුදල',
      balanceLabel: 'ඉතිරි මුදල',
      paymentMethod: 'ගෙවීමේ ක්‍රමය',
      paymentStatus: 'ගෙවීමේ තත්ත්වය',
      statusPaid: 'සම්පූර්ණයෙන්ම ගෙවා ඇත',
      statusPartial: 'කොටසක් ගෙවා ඇත',
      thankYou: 'ලයන්ස් ඉංජිනියරින් සහ ටූල් රෙන්ටල්ස් ආයතනය තෝරා ගැනීම පිළිබඳව ඔබට ස්තූතියි!',
      depositDisclaimer: 'ඇප මුදල් නැවත ලබාගැනීමට මෙම රිසිට්පත ඉදිරිපත් කරන්න.',
      printBtn: 'රිසිට්පත මුද්‍රණය කරන්න (POS Thermal)',
      savePaymentBtn: 'ගෙවීම තහවුරු කර රිසිට්පත මුද්‍රණය කරන්න',
      langSelect: 'බිල්පත් භාෂාව:'
    }
  };

  const t = dict[language] || dict.en;

  const handlePrint = () => {
    window.print();
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          rentalId: rental.id || rental._id,
          customerName: rental.user?.name || rental.customerName || 'Customer',
          paymentMethod,
          totalAmount: grandTotal,
          paidAmount: numericPaid,
          balanceAmount: balance,
          languagePreference: language
        })
      });

      if (res.ok) {
        setPaymentSuccess(true);
        if (onPaymentSuccess) onPaymentSuccess();
        setTimeout(() => {
          handlePrint();
        }, 500);
      }
    } catch (err) {
      console.error('Payment processing error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatLKR = (val) => `Rs. ${Number(val || 0).toLocaleString('en-LK')}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.title}>
      <div className="space-y-6 text-xs">
        
        {/* Language Selection & Payment Controls (Screen Only) */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 bg-slate-900/90 print:hidden">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-amber-400" /> {t.langSelect}
            </span>

            {/* Language Toggle Switch */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  language === 'en' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('si')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  language === 'si' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
                }`}
              >
                සිංහල
              </button>
            </div>
          </div>

          <form onSubmit={handleProcessPayment} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.paymentMethod}</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Cash">Cash (මුදලින්)</option>
                <option value="Card">Visa / MasterCard (කාඩ්පතින්)</option>
                <option value="Bank Transfer">Direct Bank Deposit (බැංකු තැන්පතු)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.paidAmount}</label>
              <input
                type="number"
                required
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder={grandTotal.toString()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <CreditCard className="w-4 h-4" /> {isSubmitting ? 'PROCESSING...' : t.savePaymentBtn}
              </button>
            </div>
          </form>
        </div>

        {/* Dual-Language Printable POS Thermal Receipt / Invoice (80mm & A4 Ready) */}
        <div className="bg-white text-slate-900 p-6 rounded-2xl space-y-4 print:p-0 print:shadow-none print:w-[80mm] print:max-w-full font-sans" id="printable-invoice">
          
          {/* Header & Logo */}
          <div className="text-center border-b border-slate-300 pb-3 space-y-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black mx-auto overflow-hidden shrink-0">
              {companySettings.companyLogoUrl ? (
                <img src={companySettings.companyLogoUrl} alt="Company Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Wrench className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <h2 className="font-black text-sm text-slate-900 uppercase tracking-tight">{t.companyTitle}</h2>
            <p className="text-[10px] text-slate-600">{t.companySub}</p>
            <p className="text-[10px] text-slate-500 font-mono">Tel: {companySettings.directPhone} | Mob: {companySettings.whatsappNumber}</p>
            <div className="pt-1">
              <span className="inline-block px-2.5 py-0.5 bg-slate-900 text-white rounded font-bold text-[10px] uppercase">
                {t.receiptHeader}
              </span>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-1 text-[11px] border-b border-slate-200 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Ref #:</span>
              <span className="font-mono font-bold text-slate-900">{bookingCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t.custLabel}:</span>
              <span className="font-bold text-slate-900">{t.custName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t.hirePeriod}:</span>
              <span className="font-mono text-slate-800">{new Date(rental.startDate).toLocaleDateString()} ~ {new Date(rental.endDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 font-bold uppercase text-[9px] text-slate-700">
                  <th className="py-1">{t.toolDescLabel}</th>
                  <th className="py-1 text-right">{t.dailyRateLabel}</th>
                  <th className="py-1 text-right">{t.totalLabel}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-1.5">
                    {/* Explicit Human-Readable Equipment Name */}
                    <p className="font-extrabold text-slate-900">{rental.tool?.name || rental.toolName || 'Industrial Power Tool'}</p>
                    <p className="text-[9px] text-amber-700 font-mono">{t.serialCode}: {rental.tool?.toolCode || 'TL-001'}</p>
                  </td>
                  <td className="py-1.5 text-right font-mono">{formatLKR(rental.tool?.pricePerDay || 3500)}</td>
                  <td className="py-1.5 text-right font-mono font-extrabold text-slate-900">{formatLKR(grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment & Balance Breakdown */}
          <div className="border-t border-slate-300 pt-2 space-y-1 text-[11px]">
            <div className="flex justify-between font-bold text-slate-800">
              <span>{t.totalLabel}:</span>
              <span className="font-mono">{formatLKR(grandTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>{t.paymentMethod}:</span>
              <span className="font-bold">{paymentMethod}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>{t.paidLabel}:</span>
              <span className="font-mono font-bold text-emerald-700">{formatLKR(numericPaid)}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>{t.balanceLabel}:</span>
              <span className="font-mono font-bold">{formatLKR(balance)}</span>
            </div>
            <div className="flex justify-between text-[10px] pt-1 text-slate-500">
              <span>{t.paymentStatus}:</span>
              <span className="font-bold text-emerald-800 uppercase">{numericPaid >= grandTotal ? t.statusPaid : t.statusPartial}</span>
            </div>
          </div>

          {/* Footer Terms & Security Deposit Disclaimer */}
          <div className="text-center border-t border-slate-200 pt-3 space-y-1">
            <p className="text-[10px] font-bold text-slate-800">{t.thankYou}</p>
            <p className="text-[9px] font-semibold text-amber-700 italic">{t.depositDisclaimer}</p>
            <p className="text-[9px] text-slate-400">Software by Lions Engineering & Tool Rentals Sri Lanka</p>
          </div>

          {/* Direct Print Button */}
          <div className="pt-2 text-center print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> {t.printBtn}
            </button>
          </div>

        </div>
      </div>
    </Modal>
  );
};
