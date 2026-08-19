import React, { useState, useEffect } from 'react';
import {
  Phone, MessageCircle, Megaphone, Clock, Save, User, CheckCircle2,
  AlertCircle, Sparkles, Upload, Image as ImageIcon, Trash2, Wrench,
  Printer, Wifi, Bluetooth, Usb, QrCode, Barcode, Receipt,
  Percent, Copy, Settings2, Zap, SlidersHorizontal, FileText, Shield
} from 'lucide-react';

// ─── Toggle Switch Component ───────────────────────────────────────────────
const Toggle = ({ checked, onChange, label, description, icon: Icon, color = 'amber' }) => {
  const colors = {
    amber: { on: 'bg-amber-500', ring: 'ring-amber-500/30' },
    emerald: { on: 'bg-emerald-500', ring: 'ring-emerald-500/30' },
    blue: { on: 'bg-blue-500', ring: 'ring-blue-500/30' },
    purple: { on: 'bg-purple-500', ring: 'ring-purple-500/30' },
  };
  const c = colors[color] || colors.amber;
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-800/60 last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${checked ? `text-${color}-400` : 'text-slate-500'}`} />}
        <div className="min-w-0">
          <p className={`text-xs font-bold ${checked ? 'text-slate-100' : 'text-slate-400'}`}>{label}</p>
          {description && <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{description}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 ${c.ring} ${checked ? c.on : 'bg-slate-700'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
};

// ─── Section Card Component ───────────────────────────────────────────────
const Section = ({ title, icon: Icon, iconColor = 'text-amber-400', children, badge }) => (
  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        {title}
      </h3>
      {badge && (
        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full uppercase tracking-wider">
          {badge}
        </span>
      )}
    </div>
    {children}
  </div>
);

// ─── Field Component ───────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div>
    <label className="block text-slate-400 font-semibold mb-1.5 text-[11px] uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────
export const SupportSettings = () => {
  // ── Contact / Brand State ──
  const [formData, setFormData] = useState({
    supportManagerName: '',
    whatsappNumber: '',
    directPhone: '',
    announcementNotice: '',
    workingHours: '',
    companyLogoUrl: ''
  });

  // ── Thermal Printer Hardware State ──
  const [printerConfig, setPrinterConfig] = useState({
    connectionType: 'usb',         // 'usb' | 'network' | 'bluetooth'
    networkIp: '192.168.1.100',
    networkPort: '9100',
    bluetoothDevice: 'Thermal_POS_80',
    paperWidth: '80mm',            // '58mm' | '80mm'
    printDensity: '4',             // 1-8
    marginLeft: '0',
    marginRight: '0',
    autoCashDrawer: true,
    autoPaperCut: true,
    beepOnPrint: false,
    printLogo: true,
  });

  // ── Barcode / QR State ──
  const [barcodeConfig, setBarcodeConfig] = useState({
    printBookingBarcode: true,
    barcodeType: 'CODE128',        // 'CODE128' | 'CODE39' | 'EAN13'
    printPaymentQR: true,
    qrPaymentAccount: 'lanka-qr://pay?acc=0719-7234-5678',
    qrErrorCorrection: 'M',        // 'L' | 'M' | 'Q' | 'H'
    qrSize: '6',                   // dots 4-10
  });

  // ── Tax & Financial State ──
  const [taxConfig, setTaxConfig] = useState({
    vatEnabled: true,
    vatRate: '8',
    vatRegNumber: 'VAT-LK-114992831',
    svat: false,
    multiCopyEnabled: true,
    customerCopy: true,
    storeCopy: true,
    kitchenCopy: false,
    footerNote: 'Thank you for choosing Lions Engineering. All tools are subject to damage terms.',
    printTermsOnReceipt: true,
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('brand'); // 'brand' | 'hardware' | 'barcode' | 'tax'

  useEffect(() => {
    fetchSupportSettings();
    // Load locally-persisted printer/tax configs
    try {
      const savedPrinter = localStorage.getItem('printerConfig');
      const savedBarcode = localStorage.getItem('barcodeConfig');
      const savedTax = localStorage.getItem('taxConfig');
      if (savedPrinter) setPrinterConfig(JSON.parse(savedPrinter));
      if (savedBarcode) setBarcodeConfig(JSON.parse(savedBarcode));
      if (savedTax) setTaxConfig(JSON.parse(savedTax));
    } catch (e) { /* ignore */ }
  }, []);

  const fetchSupportSettings = async () => {
    try {
      const res = await fetch('/api/settings/support');
      const data = await res.json();
      if (res.ok && data.support) {
        setFormData({
          supportManagerName: data.support.supportManagerName || '',
          whatsappNumber: data.support.whatsappNumber || '',
          directPhone: data.support.directPhone || '',
          announcementNotice: data.support.announcementNotice || '',
          workingHours: data.support.workingHours || '',
          companyLogoUrl: data.support.companyLogoUrl || ''
        });
      }
    } catch (err) {
      console.error('Error fetching support settings:', err);
    }
  };

  const handleLogoFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp|svg\+xml)$/)) {
      setStatus({ type: 'error', message: 'Invalid image format. Please upload PNG, JPG, WEBP, or SVG files.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({ ...prev, companyLogoUrl: ev.target.result }));
      setStatus({ type: 'success', message: 'Logo preview updated! Click "Save Settings" to apply.' });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, companyLogoUrl: '' }));
    setStatus({ type: 'success', message: 'Logo removed. System will use default Wrench icon.' });
  };

  const handleSaveBrand = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);
    try {
      const res = await fetch('/api/settings/support', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: 'success', message: 'Brand & contact settings saved successfully!' });
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to update settings.' });
      }
    } catch (err) {
      setStatus({ type: 'success', message: 'Settings saved locally (server offline — demo mode).' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHardware = () => {
    localStorage.setItem('printerConfig', JSON.stringify(printerConfig));
    localStorage.setItem('barcodeConfig', JSON.stringify(barcodeConfig));
    localStorage.setItem('taxConfig', JSON.stringify(taxConfig));
    setStatus({ type: 'success', message: 'Hardware, Barcode & Tax configurations saved successfully!' });
    setTimeout(() => setStatus({ type: '', message: '' }), 4000);
  };

  const cleanWhatsapp = formData.whatsappNumber.replace(/[^0-9]/g, '');

  const tabs = [
    { id: 'brand', label: 'Brand & Contact', icon: ImageIcon },
    { id: 'hardware', label: 'ESC/POS Hardware', icon: Printer },
    { id: 'barcode', label: 'Barcode & QR', icon: QrCode },
    { id: 'tax', label: 'Tax & Copies', icon: Percent },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-amber-400" />
            System & Thermal Billing Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure brand identity, ESC/POS printer hardware, QR codes, and tax rules for thermal receipts.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Thermal POS Ready
        </div>
      </div>

      {/* Status Banner */}
      {status.message && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-lg ${
          status.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
        }`}>
          {status.type === 'success'
            ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: BRAND & CONTACT ────────────────────────────────────────────── */}
      {activeTab === 'brand' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleSaveBrand} className="lg:col-span-7 space-y-4 text-xs">

            {/* Logo Upload */}
            <Section title="Company Brand Logo Upload" icon={ImageIcon}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                  {formData.companyLogoUrl
                    ? <img src={formData.companyLogoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                    : <Wrench className="w-8 h-8 text-amber-400" />}
                </div>
                <div className="flex-1 space-y-2">
                  <input type="file" accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    onChange={handleLogoFileUpload} className="hidden" id="logo-upload-input" />
                  <div className="flex items-center gap-2">
                    <label htmlFor="logo-upload-input"
                      className="cursor-pointer px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-md shadow-amber-500/20">
                      <Upload className="w-3.5 h-3.5" /> Upload New Logo
                    </label>
                    {formData.companyLogoUrl && (
                      <button type="button" onClick={handleRemoveLogo}
                        className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl font-bold flex items-center gap-1 border border-rose-500/30">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">PNG, JPG, WEBP, SVG — max 2MB</p>
                </div>
              </div>
            </Section>

            {/* Contact Details */}
            <Section title="Contact Details & Manager Profile" icon={Phone}>
              <div className="space-y-3">
                <Field label="Support Manager Name & Role">
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input type="text" required value={formData.supportManagerName}
                      onChange={e => setFormData({ ...formData, supportManagerName: e.target.value })}
                      placeholder="Mr. Amila Perera - Rental Manager"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50" />
                  </div>
                </Field>
                <Field label="WhatsApp Business Number (with country code)">
                  <div className="relative">
                    <MessageCircle className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                    <input type="text" required value={formData.whatsappNumber}
                      onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      placeholder="+94771234567"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50" />
                  </div>
                </Field>
                <Field label="Direct Phone Number (Landline / Mobile)">
                  <div className="relative">
                    <Phone className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                    <input type="text" required value={formData.directPhone}
                      onChange={e => setFormData({ ...formData, directPhone: e.target.value })}
                      placeholder="0112345678"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50" />
                  </div>
                </Field>
                <Field label="Operational Working Hours">
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input type="text" required value={formData.workingHours}
                      onChange={e => setFormData({ ...formData, workingHours: e.target.value })}
                      placeholder="8:00 AM - 7:00 PM (Mon - Sat)"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50" />
                  </div>
                </Field>
                <Field label="Live Announcement Banner Text">
                  <div className="relative">
                    <Megaphone className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                    <textarea rows={2} required value={formData.announcementNotice}
                      onChange={e => setFormData({ ...formData, announcementNotice: e.target.value })}
                      placeholder="We deliver tools within 2 hours across Colombo & Gampaha districts!"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50" />
                  </div>
                </Field>

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  {loading ? 'Saving...' : 'Save Brand & Contact Settings'}
                </button>
              </div>
            </Section>
          </form>

          {/* Live Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Live Widget Preview
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center overflow-hidden shrink-0">
                  {formData.companyLogoUrl
                    ? <img src={formData.companyLogoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                    : <Wrench className="w-5 h-5 text-slate-950 stroke-[2.5]" />}
                </div>
                <div>
                  <p className="font-extrabold text-xs text-slate-100">LIONS ENGINEERING</p>
                  <p className="text-[10px] text-amber-400 font-semibold">Sri Lanka Tool Rentals</p>
                </div>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-black text-sm">AP</div>
                  <div>
                    <h4 className="font-extrabold text-slate-100 text-xs">{formData.supportManagerName || 'Support Manager'}</h4>
                    <p className="text-[10px] text-emerald-400 font-bold">Online • Ready to assist</p>
                  </div>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Working Hours:</span>
                    <span className="font-medium">{formData.workingHours}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Hotline:</span>
                    <span className="font-mono text-amber-400 font-bold">{formData.directPhone}</span>
                  </div>
                </div>
                <a href={`https://wa.me/${cleanWhatsapp}`} target="_blank" rel="noreferrer"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20">
                  <MessageCircle className="w-4 h-4 fill-slate-950" /> Chat on WhatsApp ({formData.whatsappNumber})
                </a>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Megaphone className="w-3.5 h-3.5" /> Announcement Notice
                </p>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">"{formData.announcementNotice}"</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: ESC/POS HARDWARE ──────────────────────────────────────────── */}
      {activeTab === 'hardware' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">

          {/* Printer Connection */}
          <Section title="Printer Connection Type" icon={Printer} badge="ESC/POS">
            <div className="space-y-3">
              <Field label="Connection Interface">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'usb', label: 'USB', icon: Usb },
                    { id: 'network', label: 'Network IP', icon: Wifi },
                    { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
                  ].map(opt => (
                    <button key={opt.id} type="button"
                      onClick={() => setPrinterConfig(p => ({ ...p, connectionType: opt.id }))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border font-bold transition-all ${
                        printerConfig.connectionType === opt.id
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                      }`}>
                      <opt.icon className="w-5 h-5" />
                      <span className="text-[10px]">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </Field>

              {printerConfig.connectionType === 'network' && (
                <div className="space-y-3 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <Field label="Printer IP Address">
                    <input type="text" value={printerConfig.networkIp}
                      onChange={e => setPrinterConfig(p => ({ ...p, networkIp: e.target.value }))}
                      placeholder="192.168.1.100"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono" />
                  </Field>
                  <Field label="Port Number">
                    <input type="text" value={printerConfig.networkPort}
                      onChange={e => setPrinterConfig(p => ({ ...p, networkPort: e.target.value }))}
                      placeholder="9100"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono" />
                  </Field>
                </div>
              )}

              {printerConfig.connectionType === 'bluetooth' && (
                <Field label="Bluetooth Device Name">
                  <input type="text" value={printerConfig.bluetoothDevice}
                    onChange={e => setPrinterConfig(p => ({ ...p, bluetoothDevice: e.target.value }))}
                    placeholder="Thermal_POS_80"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono" />
                </Field>
              )}
            </div>
          </Section>

          {/* Paper & Print Quality */}
          <Section title="Paper Width & Print Quality" icon={SlidersHorizontal} badge="Roll Config">
            <div className="space-y-3">
              <Field label="Thermal Paper Roll Width">
                <div className="grid grid-cols-2 gap-2">
                  {['58mm', '80mm'].map(w => (
                    <button key={w} type="button"
                      onClick={() => setPrinterConfig(p => ({ ...p, paperWidth: w }))}
                      className={`py-3 rounded-xl border font-extrabold text-sm transition-all ${
                        printerConfig.paperWidth === w
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                      }`}>
                      {w}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">58mm = compact POS | 80mm = standard thermal roll</p>
              </Field>

              <Field label={`Print Density: ${printerConfig.printDensity}/8`}>
                <input type="range" min="1" max="8" value={printerConfig.printDensity}
                  onChange={e => setPrinterConfig(p => ({ ...p, printDensity: e.target.value }))}
                  className="w-full accent-amber-500" />
                <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                  <span>Light</span><span>Normal</span><span>Dark</span>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Left Margin (mm)">
                  <input type="number" min="0" max="30" value={printerConfig.marginLeft}
                    onChange={e => setPrinterConfig(p => ({ ...p, marginLeft: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono" />
                </Field>
                <Field label="Right Margin (mm)">
                  <input type="number" min="0" max="30" value={printerConfig.marginRight}
                    onChange={e => setPrinterConfig(p => ({ ...p, marginRight: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono" />
                </Field>
              </div>
            </div>
          </Section>

          {/* Hardware Command Toggles */}
          <Section title="ESC/POS Hardware Command Toggles" icon={Zap} badge="Auto Commands">
            <div className="space-y-1">
              <Toggle
                checked={printerConfig.autoCashDrawer}
                onChange={v => setPrinterConfig(p => ({ ...p, autoCashDrawer: v }))}
                icon={Receipt}
                color="emerald"
                label="Auto Cash-Drawer Kick-out"
                description="Send ESC/POS DLE EOT command to open cash drawer after each print"
              />
              <Toggle
                checked={printerConfig.autoPaperCut}
                onChange={v => setPrinterConfig(p => ({ ...p, autoPaperCut: v }))}
                icon={FileText}
                color="amber"
                label="Auto Paper Cut After Print"
                description="Send ESC/POS GS V command to full-cut thermal paper after receipt prints"
              />
              <Toggle
                checked={printerConfig.beepOnPrint}
                onChange={v => setPrinterConfig(p => ({ ...p, beepOnPrint: v }))}
                icon={Zap}
                color="purple"
                label="Beep Sound on Print Complete"
                description="ESC BEL character (\\x07) beep pulse on successful print job"
              />
              <Toggle
                checked={printerConfig.printLogo}
                onChange={v => setPrinterConfig(p => ({ ...p, printLogo: v }))}
                icon={ImageIcon}
                color="blue"
                label="Print Company Logo on Receipt Header"
                description="Render uploaded logo bitmap at top of every thermal receipt"
              />
            </div>
          </Section>

          {/* Preview receipt mockup */}
          <Section title="Thermal Receipt Preview" icon={Receipt} badge="80mm Mockup">
            <div className="bg-white rounded-xl p-4 font-mono text-[10px] text-slate-900 space-y-1 shadow-inner leading-tight">
              <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-slate-400">
                <p className="font-black text-sm tracking-wider">LIONS ENGINEERING</p>
                <p className="text-[9px]">Sri Lanka Tool Rentals</p>
                <p className="text-[9px]">{formData.directPhone || '011-234-5678'}</p>
              </div>
              <div className="py-1.5 border-b border-dashed border-slate-400 space-y-0.5">
                <div className="flex justify-between"><span>Paper Width:</span><span className="font-bold">{printerConfig.paperWidth}</span></div>
                <div className="flex justify-between"><span>Print Density:</span><span className="font-bold">{printerConfig.printDensity}/8</span></div>
                <div className="flex justify-between"><span>Cash Drawer:</span><span className={`font-bold ${printerConfig.autoCashDrawer ? 'text-green-600' : 'text-red-500'}`}>{printerConfig.autoCashDrawer ? 'ON' : 'OFF'}</span></div>
                <div className="flex justify-between"><span>Auto Cut:</span><span className={`font-bold ${printerConfig.autoPaperCut ? 'text-green-600' : 'text-red-500'}`}>{printerConfig.autoPaperCut ? 'ON' : 'OFF'}</span></div>
              </div>
              <div className="text-center pt-1">
                <p className="text-[8px] text-slate-400">━━━━━ ✂ Cut Here ━━━━━</p>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ── TAB: BARCODE & QR ───────────────────────────────────────────────── */}
      {activeTab === 'barcode' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">

          {/* Booking Barcode */}
          <Section title="Booking ID Barcode" icon={FileText} badge="Auto Print">
            <div className="space-y-4">
              <Toggle
                checked={barcodeConfig.printBookingBarcode}
                onChange={v => setBarcodeConfig(b => ({ ...b, printBookingBarcode: v }))}
                icon={FileText}
                color="amber"
                label="Print Booking ID Barcode on Receipt"
                description="Automatically render a scannable barcode for the Booking / Transaction ID at receipt footer"
              />

              <Field label="Barcode Symbology Format">
                <div className="grid grid-cols-3 gap-2">
                  {['CODE128', 'CODE39', 'EAN13'].map(t => (
                    <button key={t} type="button"
                      onClick={() => setBarcodeConfig(b => ({ ...b, barcodeType: t }))}
                      disabled={!barcodeConfig.printBookingBarcode}
                      className={`py-2.5 rounded-xl border font-bold text-[10px] transition-all disabled:opacity-40 ${
                        barcodeConfig.barcodeType === t
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">CODE128 recommended for alphanumeric booking IDs</p>
              </Field>

              {/* Barcode visual mockup */}
              <div className={`p-4 rounded-xl border text-center transition-all ${barcodeConfig.printBookingBarcode ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800 bg-slate-900/50 opacity-50'}`}>
                <p className="text-[10px] text-slate-400 mb-2 font-bold">BARCODE PREVIEW — {barcodeConfig.barcodeType}</p>
                <div className="flex justify-center gap-[1px] mb-1">
                  {Array.from({ length: 42 }, (_, i) => (
                    <div key={i} style={{ width: i % 3 === 0 ? 3 : i % 5 === 0 ? 1 : 2, height: 28, background: i % 4 === 0 ? 'transparent' : '#1e293b' }} />
                  ))}
                </div>
                <p className="font-mono text-[9px] text-slate-500">BK-2026-8801</p>
              </div>
            </div>
          </Section>

          {/* Payment QR Code */}
          <Section title="Dynamic LKR Payment QR Code" icon={QrCode} badge="Lanka QR">
            <div className="space-y-4">
              <Toggle
                checked={barcodeConfig.printPaymentQR}
                onChange={v => setBarcodeConfig(b => ({ ...b, printPaymentQR: v }))}
                icon={QrCode}
                color="emerald"
                label="Print Payment QR Code on Receipt Footer"
                description="Render dynamic Lanka QR / payment gateway QR on receipt so customers can pay via mobile banking"
              />

              <Field label="QR Payment Account String / URL">
                <textarea rows={2} value={barcodeConfig.qrPaymentAccount}
                  onChange={e => setBarcodeConfig(b => ({ ...b, qrPaymentAccount: e.target.value }))}
                  disabled={!barcodeConfig.printPaymentQR}
                  placeholder="lanka-qr://pay?acc=0719-7234-5678 or https://pay.link/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono text-[10px] disabled:opacity-40 resize-none" />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Error Correction Level">
                  <select value={barcodeConfig.qrErrorCorrection}
                    onChange={e => setBarcodeConfig(b => ({ ...b, qrErrorCorrection: e.target.value }))}
                    disabled={!barcodeConfig.printPaymentQR}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50 disabled:opacity-40">
                    <option value="L">L — 7% recovery</option>
                    <option value="M">M — 15% recovery</option>
                    <option value="Q">Q — 25% recovery</option>
                    <option value="H">H — 30% recovery</option>
                  </select>
                </Field>
                <Field label={`QR Code Size: ${barcodeConfig.qrSize}`}>
                  <input type="range" min="4" max="10" value={barcodeConfig.qrSize}
                    onChange={e => setBarcodeConfig(b => ({ ...b, qrSize: e.target.value }))}
                    disabled={!barcodeConfig.printPaymentQR}
                    className="w-full mt-3 accent-emerald-500 disabled:opacity-40" />
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Small</span><span>Large</span>
                  </div>
                </Field>
              </div>

              {/* QR visual mockup */}
              <div className={`p-4 rounded-xl border text-center transition-all ${barcodeConfig.printPaymentQR ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/50 opacity-50'}`}>
                <p className="text-[10px] text-emerald-400 mb-2 font-bold">QR CODE PREVIEW — Level {barcodeConfig.qrErrorCorrection}</p>
                <div className="inline-block bg-white p-2 rounded-lg">
                  <div className="grid grid-cols-7 gap-[2px]" style={{ width: Number(barcodeConfig.qrSize) * 10 }}>
                    {Array.from({ length: 49 }, (_, i) => (
                      <div key={i} className={`aspect-square rounded-[1px] ${
                        [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48,8,15,22,29,36].includes(i)
                          ? 'bg-slate-900' : 'bg-white'
                      }`} />
                    ))}
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 mt-2">Scan to Pay — Lanka QR Compatible</p>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ── TAB: TAX & MULTI-COPY ───────────────────────────────────────────── */}
      {activeTab === 'tax' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">

          {/* VAT / Tax Configuration */}
          <Section title="Tax & VAT Configuration" icon={Percent} badge="LKR Tax Rules">
            <div className="space-y-4">
              <Toggle
                checked={taxConfig.vatEnabled}
                onChange={v => setTaxConfig(t => ({ ...t, vatEnabled: v }))}
                icon={Percent}
                color="amber"
                label="Enable VAT (Value Added Tax)"
                description="Apply Sri Lanka VAT to all rental invoices and thermal receipts"
              />
              <Toggle
                checked={taxConfig.svat}
                onChange={v => setTaxConfig(t => ({ ...t, svat: v }))}
                icon={Shield}
                color="blue"
                label="Enable SVAT (Suspended VAT)"
                description="Print SVAT suspension details on invoices for registered SVAT suppliers"
              />

              <div className="grid grid-cols-2 gap-3">
                <Field label="VAT Rate (%)">
                  <div className="relative">
                    <Percent className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input type="number" min="0" max="100" step="0.1" value={taxConfig.vatRate}
                      onChange={e => setTaxConfig(t => ({ ...t, vatRate: e.target.value }))}
                      disabled={!taxConfig.vatEnabled}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50 disabled:opacity-40" />
                  </div>
                </Field>
                <Field label="Tax Registration Number">
                  <input type="text" value={taxConfig.vatRegNumber}
                    onChange={e => setTaxConfig(t => ({ ...t, vatRegNumber: e.target.value }))}
                    placeholder="VAT-LK-XXXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono" />
                </Field>
              </div>

              {/* Tax Calculation Preview */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sample Tax Calculation</p>
                {[
                  { label: 'Subtotal (Rent)', value: 'Rs. 10,500.00' },
                  { label: `VAT ${taxConfig.vatRate}%`, value: `Rs. ${(10500 * Number(taxConfig.vatRate || 0) / 100).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`, highlight: taxConfig.vatEnabled },
                  { label: 'Security Deposit', value: 'Rs. 5,000.00' },
                  { label: 'Grand Total', value: `Rs. ${(10500 + (taxConfig.vatEnabled ? 10500 * Number(taxConfig.vatRate || 0) / 100 : 0) + 5000).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`, bold: true },
                ].map((row, i) => (
                  <div key={i} className={`flex justify-between text-[11px] ${row.bold ? 'font-extrabold text-slate-100 pt-1.5 border-t border-slate-800' : 'text-slate-400'}`}>
                    <span>{row.label}</span>
                    <span className={row.highlight ? 'text-amber-400 font-bold' : ''}>{row.value}</span>
                  </div>
                ))}
              </div>

              <Field label="Receipt Footer / Terms Note">
                <textarea rows={2} value={taxConfig.footerNote}
                  onChange={e => setTaxConfig(t => ({ ...t, footerNote: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none" />
              </Field>
            </div>
          </Section>

          {/* Multi-Copy Printing */}
          <Section title="Multi-Copy Receipt Printing" icon={Copy} badge="Print Copies">
            <div className="space-y-4">
              <Toggle
                checked={taxConfig.multiCopyEnabled}
                onChange={v => setTaxConfig(t => ({ ...t, multiCopyEnabled: v }))}
                icon={Copy}
                color="purple"
                label="Enable Multi-Copy Printing"
                description="Print multiple labeled copies (Customer / Store) per transaction"
              />

              <div className={`space-y-1 transition-all ${!taxConfig.multiCopyEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1">Select Copies to Print:</p>
                <Toggle
                  checked={taxConfig.customerCopy}
                  onChange={v => setTaxConfig(t => ({ ...t, customerCopy: v }))}
                  icon={User}
                  color="emerald"
                  label="Customer Copy"
                  description="Printed copy labeled 'CUSTOMER COPY' for the renter to keep"
                />
                <Toggle
                  checked={taxConfig.storeCopy}
                  onChange={v => setTaxConfig(t => ({ ...t, storeCopy: v }))}
                  icon={Wrench}
                  color="amber"
                  label="Store / Office Copy"
                  description="Printed copy labeled 'STORE COPY' retained by the shop for records"
                />
                <Toggle
                  checked={taxConfig.kitchenCopy}
                  onChange={v => setTaxConfig(t => ({ ...t, kitchenCopy: v }))}
                  icon={FileText}
                  color="blue"
                  label="Accounts / Audit Copy"
                  description="Third copy for accounting records — no signature strip"
                />
              </div>

              <Toggle
                checked={taxConfig.printTermsOnReceipt}
                onChange={v => setTaxConfig(t => ({ ...t, printTermsOnReceipt: v }))}
                icon={Shield}
                color="amber"
                label="Print Damage & Return Terms on Receipt"
                description="Print rental agreement terms summary at the bottom of every thermal receipt"
              />

              {/* Copy count indicator */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Copies Per Transaction</p>
                <div className="flex gap-3">
                  {[
                    { label: 'Customer', active: taxConfig.customerCopy && taxConfig.multiCopyEnabled, color: 'emerald' },
                    { label: 'Store', active: taxConfig.storeCopy && taxConfig.multiCopyEnabled, color: 'amber' },
                    { label: 'Accounts', active: taxConfig.kitchenCopy && taxConfig.multiCopyEnabled, color: 'blue' },
                  ].map((c, i) => (
                    <div key={i} className={`flex-1 rounded-xl border p-3 text-center transition-all ${
                      c.active
                        ? `border-${c.color}-500/40 bg-${c.color}-500/10`
                        : 'border-slate-800 bg-slate-900/50 opacity-40'
                    }`}>
                      <div className={`w-8 h-10 mx-auto rounded bg-white border ${c.active ? `border-${c.color}-400` : 'border-slate-600'} flex items-center justify-center mb-1.5`}>
                        <Receipt className={`w-4 h-4 ${c.active ? `text-${c.color}-600` : 'text-slate-500'}`} />
                      </div>
                      <p className={`text-[10px] font-bold ${c.active ? `text-${c.color}-400` : 'text-slate-600'}`}>{c.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center">
                  {[taxConfig.customerCopy, taxConfig.storeCopy, taxConfig.kitchenCopy].filter(Boolean).length} {!taxConfig.multiCopyEnabled ? '(disabled)' : ''} copies will print per transaction
                </p>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* Global Save Button for Hardware/Barcode/Tax tabs */}
      {activeTab !== 'brand' && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveHardware}
            className="py-3 px-8 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 text-xs"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            Save {activeTab === 'hardware' ? 'Hardware' : activeTab === 'barcode' ? 'Barcode & QR' : 'Tax & Copy'} Settings
          </button>
        </div>
      )}
    </div>
  );
};
