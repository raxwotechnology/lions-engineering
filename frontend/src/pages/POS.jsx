import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchApi } from '../services/api';
import {
  ShoppingCart, Search, Plus, Minus, Trash2, X, Check,
  Printer, User, Package, CreditCard, Banknote, Phone,
  RefreshCw, Receipt, ChevronRight, Tag, Zap, AlertTriangle,
  TrendingUp, Calendar, Hash, Globe, FileText, CheckCircle,
  Eye, FileCheck, Layers
} from 'lucide-react';

const PAY_METHODS = ['Cash', 'Card', 'Bank Transfer', 'Mobile Pay'];

function POSProductCard({ product, onAdd }) {
  const isOut = product.stock <= 0;
  const isLow = product.stock > 0 && product.stock <= product.minStockAlert;
  return (
    <button
      onClick={() => !isOut && onAdd(product)}
      disabled={isOut}
      className={`relative bg-slate-800 border rounded-xl p-3 text-left transition-all group ${isOut ? 'border-slate-700 opacity-50 cursor-not-allowed' : 'border-slate-700 hover:border-amber-500/50 hover:bg-slate-700/60 active:scale-95'}`}
    >
      {isLow && !isOut && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Low stock" />
      )}
      {isOut && (
        <span className="absolute top-2 right-2 text-[9px] font-black text-rose-400 bg-rose-500/15 px-1.5 py-0.5 rounded-md">OUT</span>
      )}
      <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center mb-2">
        <Package className="w-4 h-4 text-amber-400" />
      </div>
      <p className="font-bold text-slate-200 text-xs leading-tight line-clamp-2">{product.name}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{product.productCode}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-emerald-400 font-black text-sm">Rs. {(product.sellingPrice || 0).toLocaleString()}</span>
        <span className="text-[10px] text-slate-500">{product.stock} {product.unit}</span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-amber-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <Plus className="w-6 h-6 text-amber-400 stroke-[3]" />
      </div>
    </button>
  );
}

function getCashierName() {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.name) return u.name;
    }
  } catch (e) {}
  return 'Alexander Wright (Admin)';
}

function generateReceiptHtml(sale, language = 'en', format = 'thermal') {
  const isSi = language === 'si';
  const isThermal = format === 'thermal';
  const cashier = getCashierName();
  const dateStr = new Date(sale.createdAt || Date.now()).toLocaleString(
    isSi ? 'si-LK' : 'en-GB',
    { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  const subtotal = Number(sale.subtotal || 0);
  const discount = Number(sale.discount || 0);
  const total = Number(sale.totalAmount || 0);
  const paid = Number(sale.paidAmount || total);
  const change = Number(sale.changeAmount || 0);

  if (isThermal) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt ${sale.invoiceNumber || 'POS'}</title>
  <style>
    @page { size: 80mm auto; margin: 2mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace, system-ui, sans-serif;
      font-size: 11.5px;
      line-height: 1.35;
      color: #000;
      background: #fff;
      width: 74mm;
      margin: 0 auto;
      padding: 4px 2px;
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .title { font-size: 15px; font-weight: 900; letter-spacing: 0.5px; margin: 0; }
    .subtitle { font-size: 9.5px; margin-top: 2px; text-transform: uppercase; }
    .contact { font-size: 9px; line-height: 1.25; margin-top: 2px; }
    .dash { border-top: 1px dashed #000; margin: 6px 0; }
    .double { border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 4px 0; margin: 6px 0; }
    .meta-table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 4px; }
    .meta-table td { padding: 1.5px 0; }
    .items-table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 4px 0; }
    .items-table th { border-bottom: 1px dashed #000; padding: 3px 0; text-align: left; font-size: 10px; font-weight: bold; }
    .items-table td { padding: 3px 0; vertical-align: top; }
    .summary-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 2px; }
    .summary-table td { padding: 2px 0; }
    .grand-total { font-size: 14px; font-weight: 900; }
    .badge { display: inline-block; padding: 2px 8px; border: 1px solid #000; font-size: 10px; font-weight: bold; text-transform: uppercase; margin: 4px 0; }
    .barcode { text-align: center; margin: 6px 0 2px; font-size: 11px; letter-spacing: 2px; font-weight: bold; }
    .barcode-bars { height: 26px; background: repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 7px, transparent 7px, transparent 9px); width: 85%; margin: 3px auto; }
    .footer { font-size: 9px; text-align: center; margin-top: 8px; line-height: 1.3; }
    @media print {
      body { width: 100%; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="center">
    <div class="title">LIONS ENGINEERING</div>
    <div class="subtitle">${isSi ? 'කාර්මික මෙවලම් කුලියට දීම සහ අලෙවිය' : 'Tool Rental & Industrial Supplies'}</div>
    <div class="contact">
      145 Industrial Zone Rd, Colombo 05<br/>
      Hotline: 011-2345678 | WhatsApp: +94 77 123 4567<br/>
      Reg No: PV-901284
    </div>
    <div class="badge">${sale.isDraft ? (isSi ? 'ඇස්තමේන්තු බිල්පත (PROFORMA)' : 'PROFORMA / ESTIMATE BILL') : (isSi ? 'නිල විකුණුම් රිසිට්පත (PAID)' : 'OFFICIAL SALES RECEIPT')}</div>
  </div>

  <div class="dash"></div>

  <table class="meta-table">
    <tr>
      <td><b>${isSi ? 'බිල්පත් අංකය' : 'Invoice #'}:</b></td>
      <td class="right bold">${sale.invoiceNumber || 'INV-DRAFT'}</td>
    </tr>
    <tr>
      <td><b>${isSi ? 'දිනය' : 'Date'}:</b></td>
      <td class="right">${dateStr}</td>
    </tr>
    <tr>
      <td><b>${isSi ? 'පාරිභෝගිකයා' : 'Customer'}:</b></td>
      <td class="right">${sale.customerName || 'Walk-in Customer'}</td>
    </tr>
    ${sale.customerPhone ? `<tr><td><b>${isSi ? 'දුරකථන' : 'Phone'}:</b></td><td class="right">${sale.customerPhone}</td></tr>` : ''}
    <tr>
      <td><b>${isSi ? 'අයකැමි' : 'Cashier'}:</b></td>
      <td class="right">${cashier}</td>
    </tr>
  </table>

  <div class="dash"></div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width:50%">${isSi ? 'භාණ්ඩ විස්තරය' : 'Item Description'}</th>
        <th class="center" style="width:15%">${isSi ? 'ප්‍රම.' : 'Qty'}</th>
        <th class="right" style="width:17%">${isSi ? 'මිල' : 'Price'}</th>
        <th class="right" style="width:18%">${isSi ? 'මුදල' : 'Total'}</th>
      </tr>
    </thead>
    <tbody>
      ${(sale.items || []).map(i => `
        <tr>
          <td>
            <div class="bold">${i.productName}</div>
            ${i.productCode ? `<div style="font-size:9px;color:#333;">${i.productCode}</div>` : ''}
          </td>
          <td class="center">${i.qty} ${i.unit || ''}</td>
          <td class="right">${Number(i.sellingPrice || 0).toLocaleString()}</td>
          <td class="right bold">${Number(i.total || 0).toLocaleString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="dash"></div>

  <table class="summary-table">
    <tr>
      <td>${isSi ? 'අතුරු එකතුව' : 'Subtotal'}:</td>
      <td class="right">Rs. ${subtotal.toLocaleString()}</td>
    </tr>
    ${discount > 0 ? `
    <tr>
      <td>${isSi ? 'වට්ටම්' : 'Discount'}:</td>
      <td class="right">- Rs. ${discount.toLocaleString()}</td>
    </tr>` : ''}
    <tr class="grand-total">
      <td style="padding: 4px 0;">${isSi ? 'ගෙවිය යුතු මුළු එකතුව' : 'TOTAL AMOUNT'}:</td>
      <td class="right" style="padding: 4px 0;">Rs. ${total.toLocaleString()}</td>
    </tr>
    <tr>
      <td>${isSi ? 'ගෙවීම් ක්‍රමය' : 'Payment Method'}:</td>
      <td class="right bold">${sale.paymentMethod || 'Cash'}</td>
    </tr>
    <tr>
      <td>${isSi ? 'ලැබුණු මුදල' : 'Tendered'}:</td>
      <td class="right">Rs. ${paid.toLocaleString()}</td>
    </tr>
    ${change > 0 ? `
    <tr class="bold">
      <td>${isSi ? 'ඉතිරි මුදල (Change)' : 'Change Due'}:</td>
      <td class="right">Rs. ${change.toLocaleString()}</td>
    </tr>` : ''}
  </table>

  <div class="dash"></div>

  <div class="barcode">
    <div class="barcode-bars"></div>
    *${sale.invoiceNumber || 'LIONS-POS'}*
  </div>

  <div class="footer">
    <b>${isSi ? 'ස්තූතියි! නැවත එන්න.' : 'Thank you for your purchase!'}</b><br/>
    ${isSi ? 'දින 7ක් ඇතුළත බිල්පත සමග භාණ්ඩ හුවමාරු කළ හැක.' : 'Goods can be exchanged within 7 days with this receipt.'}<br/>
    Powered by Lions Engineering POS
  </div>
</body>
</html>`;
  }

  // A4 Standard Format
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${sale.invoiceNumber || 'POS'}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #1e293b;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .header-box { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
    .brand-title { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; font-weight: 700; color: #d97706; text-transform: uppercase; margin-top: 2px; }
    .brand-meta { font-size: 11px; color: #64748b; margin-top: 6px; line-height: 1.35; }
    .inv-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #ecfdf5; color: #065f46; font-weight: 800; font-size: 11px; border: 1px solid #a7f3d0; }
    .inv-details { text-align: right; }
    .inv-number { font-size: 16px; font-weight: 900; font-family: monospace; color: #0f172a; margin-top: 6px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; font-size: 11.5px; }
    .info-col h4 { margin: 0 0 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; }
    table.table-items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    table.table-items th { background: #f1f5f9; color: #334155; font-size: 10.5px; text-transform: uppercase; font-weight: 800; padding: 10px 12px; border-bottom: 2px solid #cbd5e1; text-align: left; }
    table.table-items td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11.5px; vertical-align: middle; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .summary-section { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 10px; padding-top: 12px; }
    .terms-box { font-size: 10px; color: #64748b; max-width: 55%; line-height: 1.45; }
    .totals-box { width: 320px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; font-size: 12px; }
    .totals-box .row { display: flex; justify-content: space-between; margin-bottom: 6px; color: #475569; }
    .totals-box .grand-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #0f172a; border-top: 2px solid #e2e8f0; padding-top: 8px; margin-top: 8px; }
    .sign-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; padding-top: 20px; text-align: center; }
    .sign-line { border-top: 1px dashed #94a3b8; padding-top: 6px; font-size: 11px; font-weight: 600; color: #475569; }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <h1 class="brand-title">LIONS ENGINEERING & TOOL RENTALS</h1>
      <div class="brand-sub">${isSi ? 'කාර්මික මෙවලම් කුලියට දීම සහ අලෙවිය' : 'Official Hardware & Engineering Equipment Store'}</div>
      <div class="brand-meta">
        No. 145 Industrial Zone Road, Colombo 05, Sri Lanka<br/>
        Hotline: 011-2345678 | WhatsApp: +94 77 123 4567 | Reg: PV-901284
      </div>
    </div>
    <div class="inv-details">
      <span class="inv-badge">${sale.isDraft ? (isSi ? 'ඇස්තමේන්තුව (PROFORMA)' : 'PROFORMA BILL') : (isSi ? 'ගෙවන ලද බිල්පත (PAID)' : 'PAID TAX INVOICE')}</span>
      <div class="inv-number">${sale.invoiceNumber || 'INV-DRAFT'}</div>
      <div style="font-size:11px;color:#64748b;margin-top:4px;">${dateStr}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-col">
      <h4>${isSi ? 'පාරිභෝගික විස්තර (Customer Details)' : 'Billed To (Customer Details)'}</h4>
      <p style="margin:2px 0;font-weight:bold;font-size:13px;color:#0f172a;">${sale.customerName || 'Walk-in Customer'}</p>
      <p style="margin:2px 0;color:#64748b;">${sale.customerPhone ? 'Phone: ' + sale.customerPhone : 'Direct Walk-in'}</p>
    </div>
    <div class="info-col" style="text-align:right;">
      <h4>${isSi ? 'ගනුදෙනු විස්තර (Transaction Meta)' : 'Transaction Details'}</h4>
      <p style="margin:2px 0;"><b>${isSi ? 'අයකැමි' : 'Cashier'}:</b> ${cashier}</p>
      <p style="margin:2px 0;"><b>${isSi ? 'ගෙවීම් මාධ්‍යය' : 'Payment Method'}:</b> ${sale.paymentMethod || 'Cash'}</p>
    </div>
  </div>

  <table class="table-items">
    <thead>
      <tr>
        <th style="width:8%">#</th>
        <th style="width:48%">${isSi ? 'භාණ්ඩ විස්තරය' : 'Product / Item Name'}</th>
        <th class="text-center" style="width:14%">${isSi ? 'ප්‍රමාණය' : 'Quantity'}</th>
        <th class="text-right" style="width:15%">${isSi ? 'ඒකක මිල' : 'Unit Price'}</th>
        <th class="text-right" style="width:15%">${isSi ? 'මුළු මුදල' : 'Line Total'}</th>
      </tr>
    </thead>
    <tbody>
      ${(sale.items || []).map((i, idx) => `
        <tr>
          <td style="color:#94a3b8;font-weight:bold;">${idx + 1}</td>
          <td>
            <div style="font-weight:bold;color:#0f172a;">${i.productName}</div>
            ${i.productCode ? `<div style="font-size:10px;color:#64748b;font-family:monospace;">Code: ${i.productCode}</div>` : ''}
          </td>
          <td class="text-center" style="font-weight:bold;">${i.qty} ${i.unit || ''}</td>
          <td class="text-right font-mono">Rs. ${Number(i.sellingPrice || 0).toLocaleString()}</td>
          <td class="text-right font-mono" style="font-weight:bold;color:#0f172a;">Rs. ${Number(i.total || 0).toLocaleString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="summary-section">
    <div class="terms-box">
      <p style="font-weight:bold;margin:0 0 4px;color:#0f172a;">${isSi ? 'නියමයන් සහ කොන්දේසි:' : 'Terms & Store Policies:'}</p>
      <p style="margin:0 0 3px;">1. ${isSi ? 'භාණ්ඩ මිලදී ගත් දින සිට දින 7ක් ඇතුළත බිල්පත සමග හුවමාරු කළ හැක.' : 'Goods sold are exchangeable within 7 days in original condition with this receipt.'}</p>
      <p style="margin:0 0 3px;">2. ${isSi ? 'මුදල් ආපසු ගෙවනු නොලැබේ. උපකරණ හෝ භාණ්ඩ හුවමාරුව පමණක් වලංගු වේ.' : 'No cash refunds. Exchange or store credit only.'}</p>
      <p style="margin:0;">3. Official system generated receipt by Lions Engineering Sri Lanka.</p>
    </div>

    <div class="totals-box">
      <div class="row">
        <span>${isSi ? 'අතුරු එකතුව (Subtotal)' : 'Subtotal'}:</span>
        <span style="font-weight:bold;">Rs. ${subtotal.toLocaleString()}</span>
      </div>
      ${discount > 0 ? `
      <div class="row" style="color:#e11d48;">
        <span>${isSi ? 'වට්ටම් (Discount)' : 'Discount'}:</span>
        <span style="font-weight:bold;">- Rs. ${discount.toLocaleString()}</span>
      </div>` : ''}
      <div class="grand-row">
        <span>${isSi ? 'මුළු මුදල (TOTAL)' : 'Grand Total'}:</span>
        <span style="color:#d97706;">Rs. ${total.toLocaleString()}</span>
      </div>
      <div class="row" style="margin-top:8px;">
        <span>${isSi ? 'ගෙවූ මුදල (Paid)' : 'Paid Amount'}:</span>
        <span style="font-weight:bold;">Rs. ${paid.toLocaleString()}</span>
      </div>
      ${change > 0 ? `
      <div class="row" style="color:#059669;font-weight:bold;">
        <span>${isSi ? 'ඉතිරි මුදල (Change)' : 'Change Due'}:</span>
        <span>Rs. ${change.toLocaleString()}</span>
      </div>` : ''}
    </div>
  </div>

  <div class="sign-section">
    <div class="sign-line">${isSi ? 'පාරිභෝගික අත්සන' : 'Customer Signature'}</div>
    <div class="sign-line">${isSi ? 'බලයලත් නිලධාරී / අයකැමි' : 'Authorized Store Officer'}</div>
  </div>
</body>
</html>`;
}

export const executePrintReceipt = (sale, language = 'en', format = 'thermal') => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const html = generateReceiptHtml(sale, language, format);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  iframe.contentWindow.focus();
  setTimeout(() => {
    try {
      iframe.contentWindow.print();
    } catch (err) {
      console.warn('Iframe print failed, falling back to popup:', err);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        win.focus();
        win.print();
      }
    }
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1500);
  }, 300);
};

function InvoicePrint({ sale, onClose, onCompleteDraft }) {
  const [language, setLanguage] = useState('en'); // 'en' | 'si'
  const [format, setFormat] = useState('thermal'); // 'thermal' | 'a4'

  const handlePrint = () => {
    executePrintReceipt(sale, language, format);
  };

  const isSi = language === 'si';
  const subtotal = Number(sale.subtotal || 0);
  const discount = Number(sale.discount || 0);
  const total = Number(sale.totalAmount || 0);
  const paid = Number(sale.paidAmount || total);
  const change = Number(sale.changeAmount || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sale.isDraft ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
              {sale.isDraft ? <FileText className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-black text-slate-100 text-base sm:text-lg flex items-center gap-2">
                {sale.isDraft ? 'Bill Preview / Quotation' : 'Sale Complete & Bill Ready'}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sale.isDraft ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                  {sale.isDraft ? 'DRAFT' : 'PAID'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{sale.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format & Language Selection Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 sm:px-5 py-3 bg-slate-800/70 border-b border-slate-800 shrink-0">
          {/* Format Switcher */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-bold text-[11px] mr-1">Format:</span>
            <button
              onClick={() => setFormat('thermal')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${format === 'thermal' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-700'}`}
            >
              Thermal 80mm
            </button>
            <button
              onClick={() => setFormat('a4')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${format === 'a4' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-700'}`}
            >
              A4 Sheet
            </button>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 text-xs">
            <Globe className="w-3.5 h-3.5 text-amber-400 mr-0.5" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${language === 'en' ? 'bg-slate-700 text-amber-400 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => setLanguage('si')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${language === 'si' ? 'bg-slate-700 text-amber-400 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🇱🇰 සිංහල
            </button>
          </div>
        </div>

        {/* Receipt Live Preview Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 bg-slate-950/40">
          
          {/* Change return callout if any */}
          {change > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-300/90 font-medium">{isSi ? 'පාරිභෝගිකයාට ලබාදිය යුතු ඉතිරි මුදල' : 'Change to return customer'}</p>
                <p className="text-lg font-black text-amber-400">Rs. {change.toLocaleString()}</p>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <p>Paid: Rs. {paid.toLocaleString()}</p>
                <p>Total: Rs. {total.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Paper Receipt Simulation */}
          <div className="bg-white text-slate-900 rounded-xl p-5 shadow-inner border border-slate-300 max-w-sm mx-auto font-mono text-xs">
            <div className="text-center pb-2 border-b border-dashed border-slate-400">
              <h3 className="font-black text-sm tracking-wide text-slate-900">LIONS ENGINEERING</h3>
              <p className="text-[10px] text-slate-600 uppercase font-semibold">{isSi ? 'කාර්මික මෙවලම් කුලියට දීම සහ අලෙවිය' : 'Tool Rental & Industrial Supplies'}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">145 Industrial Zone Rd, Colombo 05</p>
              <p className="text-[9px] text-slate-500">Hotline: 011-2345678</p>
              <div className="mt-2 inline-block px-2 py-0.5 border border-slate-800 text-[10px] font-bold uppercase rounded">
                {sale.isDraft ? (isSi ? 'ඇස්තමේන්තුව' : 'PROFORMA BILL') : (isSi ? 'නිල විකුණුම් රිසිට්පත' : 'SALES RECEIPT')}
              </div>
            </div>

            <div className="py-2.5 text-[11px] border-b border-dashed border-slate-400 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">{isSi ? 'බිල්පත් අංකය' : 'Invoice #'}:</span>
                <span className="font-bold text-slate-900">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isSi ? 'දිනය' : 'Date'}:</span>
                <span>{new Date(sale.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isSi ? 'පාරිභෝගිකයා' : 'Customer'}:</span>
                <span className="font-semibold text-slate-900">{sale.customerName || 'Walk-in'}</span>
              </div>
              {sale.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{isSi ? 'දුරකථන' : 'Phone'}:</span>
                  <span>{sale.customerPhone}</span>
                </div>
              )}
            </div>

            <table className="w-full my-2.5 text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-dashed border-slate-400 text-slate-600 text-[10px]">
                  <th className="text-left py-1">{isSi ? 'භාණ්ඩය' : 'Item'}</th>
                  <th className="text-center py-1">{isSi ? 'ප්‍රම.' : 'Qty'}</th>
                  <th className="text-right py-1">{isSi ? 'මුදල' : 'Total'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dotted divide-slate-200">
                {(sale.items || []).map((item, idx) => (
                  <tr key={idx} className="py-1">
                    <td className="py-1.5 font-bold text-slate-900 leading-tight">
                      {item.productName}
                      <span className="block text-[9px] text-slate-500 font-normal">@ Rs. {Number(item.sellingPrice || 0).toLocaleString()}</span>
                    </td>
                    <td className="text-center py-1.5">{item.qty} {item.unit || ''}</td>
                    <td className="text-right py-1.5 font-bold">Rs. {Number(item.total || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-slate-400 pt-2 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>{isSi ? 'අතුරු එකතුව' : 'Subtotal'}:</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>{isSi ? 'වට්ටම්' : 'Discount'}:</span>
                  <span>- Rs. {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-slate-950 border-t border-slate-400 pt-1.5 mt-1">
                <span>{isSi ? 'මුළු මුදල' : 'TOTAL'}:</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1">
                <span>{isSi ? 'ගෙවූ ක්‍රමය' : 'Method'} ({sale.paymentMethod || 'Cash'}):</span>
                <span>Rs. {paid.toLocaleString()}</span>
              </div>
              {change > 0 && (
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>{isSi ? 'ඉතිරි මුදල' : 'Change'}:</span>
                  <span>Rs. {change.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="text-center mt-3 pt-2 border-t border-dashed border-slate-400 text-[9px] text-slate-500">
              <p className="font-bold text-slate-800">{isSi ? 'ස්තූතියි! නැවත එන්න.' : 'Thank you for your business!'}</p>
              <p className="mt-0.5">Lions Engineering POS Sri Lanka</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 shrink-0 flex flex-wrap gap-2.5 justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl font-bold text-xs transition-colors"
          >
            {sale.isDraft ? 'Close Preview' : 'New Sale (Close)'}
          </button>

          <div className="flex items-center gap-2">
            {sale.isDraft && onCompleteDraft && (
              <button
                onClick={onCompleteDraft}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
              >
                <Check className="w-3.5 h-3.5" /> Confirm & Complete
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              {isSi ? 'බිල්පත මුද්‍රණය කරන්න (Print)' : 'Print Bill Now'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export function POS() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [cart, setCart] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState('fixed');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [autoPrint, setAutoPrint] = useState(true);
  const [recentSales, setRecentSales] = useState([]);
  const [todayStats, setTodayStats] = useState(null);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [pData, cData, statsData] = await Promise.all([
      fetchApi('/products?status=Active', {}, { success: true, products: [] }),
      fetchApi('/customers', {}, { success: true, customers: [] }),
      fetchApi('/pos-sales/stats/summary', {}, null)
    ]);
    if (pData?.success) setProducts(pData.products || []);
    if (cData?.success) setCustomers(cData.customers || []);
    if (statsData?.success) setTodayStats(statsData);

    const salesData = await fetchApi('/pos-sales?limit=5', {}, { success: true, sales: [] });
    if (salesData?.success) setRecentSales((salesData.sales || []).slice(0, 5));
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredProducts = products.filter(p => {
    const matchCat = catFilter === 'All' || p.category === catFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.productCode || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredCustomers = customers.filter(c =>
    !customerSearch || c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)
  ).slice(0, 5);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product === product._id);
      if (existing) {
        if (existing.qty >= product.stock) return prev; // max stock
        return prev.map(i => i.product === product._id ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.sellingPrice } : i);
      }
      return [...prev, { product: product._id, productName: product.name, productCode: product.productCode, unit: product.unit, qty: 1, sellingPrice: product.sellingPrice, total: product.sellingPrice, maxStock: product.stock }];
    });
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) return removeFromCart(productId);
    setCart(prev => prev.map(i => i.product === productId ? { ...i, qty, total: qty * i.sellingPrice } : i));
  };

  const removeFromCart = (productId) => setCart(prev => prev.filter(i => i.product !== productId));
  const clearCart = () => { setCart([]); setSelectedCustomer(null); setWalkInName(''); setWalkInPhone(''); setPaidAmount(''); setDiscount(''); setNotes(''); };

  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const discountAmt = discount ? (discountType === 'percent' ? (subtotal * +discount / 100) : +discount) : 0;
  const totalAmount = Math.max(0, subtotal - discountAmt);
  const change = paidAmount ? +paidAmount - totalAmount : 0;

  const handleCheckout = async ({ printAfter = autoPrint } = {}) => {
    if (cart.length === 0) return;
    setProcessing(true);
    const payload = {
      items: cart.map(({ maxStock, ...rest }) => rest),
      customer: selectedCustomer?._id || null,
      customerName: selectedCustomer?.fullName || walkInName || 'Walk-in Customer',
      customerPhone: selectedCustomer?.phone || walkInPhone || '',
      subtotal, discount: discountAmt, discountType, totalAmount,
      paidAmount: +paidAmount || totalAmount,
      paymentMethod, paymentStatus: 'Paid', notes
    };

    const data = await fetchApi('/pos-sales', { method: 'POST', body: JSON.stringify(payload) });
    if (data?.success) {
      setCompletedSale(data.sale);
      clearCart();
      fetchData();
      if (printAfter) {
        executePrintReceipt(data.sale);
      }
    } else {
      alert(data?.message || 'Sale failed. Check stock availability.');
    }
    setProcessing(false);
  };

  const handlePreviewCurrentBill = () => {
    if (cart.length === 0) return;
    const draftSale = {
      _id: 'draft',
      isDraft: true,
      invoiceNumber: `DRAFT-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      customerName: selectedCustomer?.fullName || walkInName || 'Walk-in Customer',
      customerPhone: selectedCustomer?.phone || walkInPhone || '',
      items: cart.map(({ maxStock, ...rest }) => rest),
      subtotal,
      discount: discountAmt,
      discountType,
      totalAmount,
      paidAmount: +paidAmount || totalAmount,
      changeAmount: change > 0 ? change : 0,
      paymentMethod,
      paymentStatus: 'Pending (Draft)',
      notes
    };
    setCompletedSale(draftSale);
  };

  const inp = "w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-amber-500/60 placeholder-slate-500";

  if (loading) return (
    <div className="flex items-center justify-center min-h-64 text-slate-400 gap-3">
      <RefreshCw className="w-5 h-5 animate-spin" /> Loading POS...
    </div>
  );

  return (
    <div className="space-y-4 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-amber-400" /> Point of Sale
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Sell products & generate customer invoices</p>
        </div>
        {todayStats && (
          <div className="flex gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-center">
              <p className="text-[10px] text-slate-400">Today's Sales</p>
              <p className="font-black text-amber-400">Rs. {(todayStats.todayRevenue || 0).toLocaleString()}</p>
              <p className="text-[10px] text-slate-500">{todayStats.todayCount || 0} transactions</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* LEFT: Products Grid with independent vertical scrollbar */}
        <div className="xl:col-span-2 space-y-3 xl:max-h-[calc(100vh-140px)] xl:overflow-y-auto pr-2 pos-scrollbar">
          {/* Search & Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {categories.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${catFilter === c ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
              <Package className="w-10 h-10 opacity-30" />
              <p>No products available</p>
              <a href="/inventory" className="text-amber-400 text-xs hover:underline">→ Add products in Inventory</a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {filteredProducts.map(p => <POSProductCard key={p._id} product={p} onAdd={addToCart} />)}
            </div>
          )}
        </div>

        {/* RIGHT: Cart & Checkout with independent vertical scrollbar */}
        <div className="space-y-3 xl:max-h-[calc(100vh-140px)] xl:overflow-y-auto pr-2 pos-scrollbar">
          {/* Customer Select */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-amber-400" /> Customer</p>
            {selectedCustomer ? (
              <div className="flex items-center justify-between bg-slate-800 rounded-xl p-3">
                <div>
                  <p className="font-bold text-slate-200 text-xs">{selectedCustomer.fullName}</p>
                  <p className="text-[10px] text-slate-400">{selectedCustomer.phone}</p>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="p-1 text-slate-400 hover:text-rose-400"><X className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <input value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} placeholder="Search customer..." className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 placeholder-slate-500" />
                </div>
                {customerSearch && filteredCustomers.length > 0 && (
                  <div className="border border-slate-700 rounded-xl overflow-hidden">
                    {filteredCustomers.map(c => (
                      <button key={c._id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); }}
                        className="w-full px-3 py-2 text-left hover:bg-slate-800 text-xs border-b border-slate-700 last:border-0">
                        <p className="font-semibold text-slate-200">{c.fullName}</p>
                        <p className="text-slate-500">{c.phone}</p>
                      </button>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input value={walkInName} onChange={e => setWalkInName(e.target.value)} placeholder="Walk-in name" className={inp} />
                  <input value={walkInPhone} onChange={e => setWalkInPhone(e.target.value)} placeholder="Phone" className={inp} />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5"><ShoppingCart className="w-3.5 h-3.5 text-amber-400" /> Cart ({cart.length})</p>
              {cart.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviewCurrentBill}
                    title="Preview or print draft bill"
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-lg transition-colors"
                  >
                    <Printer className="w-3 h-3" /> Print Bill
                  </button>
                  <span className="text-slate-600">·</span>
                  <button onClick={clearCart} className="text-[10px] text-rose-400 hover:underline">Clear all</button>
                </div>
              )}
            </div>
            {cart.length === 0 ? (
              <p className="text-center text-slate-500 text-xs py-6">Click products to add to cart</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1.5 pos-scrollbar">
                {cart.map(item => (
                  <div key={item.product} className="flex items-center gap-2 bg-slate-800 rounded-xl p-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-200 text-[11px] truncate">{item.productName}</p>
                      <p className="text-[10px] text-emerald-400">Rs. {item.sellingPrice.toLocaleString()} / {item.unit}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => updateQty(item.product, item.qty - 1)} className="w-6 h-6 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center hover:bg-slate-600"><Minus className="w-3 h-3" /></button>
                      <span className="w-6 text-center font-black text-slate-200 text-xs">{item.qty}</span>
                      <button onClick={() => updateQty(item.product, item.qty + 1)} disabled={item.qty >= item.maxStock} className="w-6 h-6 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center hover:bg-slate-600 disabled:opacity-40"><Plus className="w-3 h-3" /></button>
                    </div>
                    <p className="text-xs font-black text-amber-400 w-16 text-right shrink-0">Rs. {item.total.toLocaleString()}</p>
                    <button onClick={() => removeFromCart(item.product)} className="p-1 text-slate-500 hover:text-rose-400"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Panel */}
          {cart.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-amber-400" /> Payment</p>

              {/* Discount */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="Discount" className={inp} />
                </div>
                <select value={discountType} onChange={e => setDiscountType(e.target.value)} className={`${inp} w-24`}>
                  <option value="fixed">Rs.</option>
                  <option value="percent">%</option>
                </select>
              </div>

              {/* Totals */}
              <div className="bg-slate-800 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
                {discountAmt > 0 && <div className="flex justify-between text-rose-400"><span>Discount</span><span>- Rs. {discountAmt.toLocaleString()}</span></div>}
                <div className="flex justify-between font-black text-slate-100 text-sm border-t border-slate-700 pt-1.5 mt-1.5">
                  <span>TOTAL</span><span className="text-amber-400">Rs. {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-2 gap-1.5">
                {PAY_METHODS.map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${paymentMethod === m ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                    {m}
                  </button>
                ))}
              </div>

              {/* Cash tendered */}
              <div>
                <input type="number" min={totalAmount} value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder={`Amount tendered (min Rs. ${totalAmount})`} className={inp} />
                {change > 0 && (
                  <p className="text-xs text-emerald-400 font-black mt-1 text-center">Change: Rs. {change.toLocaleString()}</p>
                )}
              </div>

              {/* Notes */}
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" className={inp} />

              {/* Auto-print receipt toggle */}
              <label className="flex items-center justify-between bg-slate-800/60 hover:bg-slate-800 px-3 py-2 rounded-xl cursor-pointer border border-slate-700/60 transition-colors select-none">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  Auto-print bill on checkout
                </span>
                <input
                  type="checkbox"
                  checked={autoPrint}
                  onChange={(e) => setAutoPrint(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-700 border-slate-600 accent-amber-500 cursor-pointer"
                />
              </label>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {/* Primary Button: Complete & Print Bill */}
                <button
                  onClick={() => handleCheckout({ printAfter: true })}
                  disabled={processing || cart.length === 0}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-60 transition-all active:scale-[0.99]"
                >
                  {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                  {processing ? 'Processing Sale...' : `Complete & Print Bill · Rs. ${totalAmount.toLocaleString()}`}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  {/* Secondary Action 1: Complete Only (no print) */}
                  <button
                    onClick={() => handleCheckout({ printAfter: false })}
                    disabled={processing || cart.length === 0}
                    className="py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Complete Only
                  </button>

                  {/* Secondary Action 2: Print Bill Preview */}
                  <button
                    onClick={handlePreviewCurrentBill}
                    disabled={cart.length === 0}
                    className="py-2.5 bg-slate-800/90 hover:bg-slate-750 border border-amber-500/40 hover:border-amber-500 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Receipt className="w-3.5 h-3.5 text-amber-400" /> Print Bill Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Sales */}
          {recentSales.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400">Recent Sales</p>
                <span className="text-[10px] text-slate-500">Re-print bill anytime</span>
              </div>
              {recentSales.map(s => (
                <div key={s._id} className="flex items-center justify-between text-xs bg-slate-800 hover:bg-slate-750 border border-slate-700/50 rounded-xl p-2.5 transition-colors">
                  <div>
                    <p className="font-mono text-amber-400 text-[10px] font-bold">{s.invoiceNumber}</p>
                    <p className="text-slate-400 text-[10px]">{s.customerName} · {s.items?.length || 0} items</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-emerald-400">Rs. {(s.totalAmount || 0).toLocaleString()}</p>
                    <button
                      onClick={() => setCompletedSale(s)}
                      title="Print / View Bill"
                      className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 text-[10px] font-bold transition-all"
                    >
                      <Printer className="w-3 h-3" /> Print
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completed Sale Invoice Modal */}
      {completedSale && (
        <InvoicePrint
          sale={completedSale}
          onClose={() => setCompletedSale(null)}
          onCompleteDraft={completedSale.isDraft ? () => {
            setCompletedSale(null);
            handleCheckout({ printAfter: true });
          } : null}
        />
      )}
    </div>
  );
}
