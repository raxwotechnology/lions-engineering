import logoUrl from '../logo.png';
import api from '../services/api';

const COMPANY_DETAILS = {
  name: 'LION ENGINEERING & TOOL RENT',
  address: 'No : 51/A Veralupitiya Road,\nSithagama Avissawella.',
  phones: ['0772138344', '077 9873051'],
  email: 'info@raxwo.com',
  regNo: '00172'
};

const safeDate = (d) => {
  try {
    if (!d) return '..............................';
    const date = new Date(d);
    return isNaN(date.getTime()) ? '..............................' : date.toLocaleDateString('en-GB');
  } catch {
    return '..............................';
  }
};

const getDynamicSettings = async () => {
  try {
    const res = await api.get('settings');
    return res.data;
  } catch (e) {
    console.warn('Settings fetch failed, using defaults');
  }
  return COMPANY_DETAILS;
};

// Unified HTML preview renderer
const openPrintWindow = (record, type = 'invoice') => {
  const isInvoice = type === 'invoice';
  const docNo = record.invoiceNo || record.quotationNo || 'DRAFT';
  const clientName = record.clientName || 'VALUED CUSTOMER';
  const clientPhone = record.clientPhone || '';
  const clientNic = record.clientNic || '';
  const clientAddress = record.clientAddress || '';

  const pickupDateFormatted = safeDate(record.pickupDate || record.date);
  const returnDateFormatted = safeDate(record.returnDate);
  const totalDays = record.totalDays || record.totalUnits || 1;

  // Build items array
  const items = [];
  
  if ((!record.items || record.items.length === 0) && record.toolNo) {
    items.push({
      name: `Tool: ${record.toolNo} (${record.toolCategory || 'N/A'})`,
      qty: record.totalUnits || record.quantity || 1,
      rate: record.dailyRate || record.ratePerUnit || 0,
      days: totalDays,
      amount: (record.dailyRate || record.ratePerUnit || 0) * (record.totalUnits || record.quantity || 1) * totalDays
    });
  }

  if (record.items && record.items.length > 0) {
    record.items.forEach((it) => {
      items.push({
        name: `${it.toolNumber ? `[${it.toolNumber}] ` : ''}Tool: ${it.model || it.category || 'Rental Tool'}`,
        qty: it.quantity || 1,
        rate: it.dailyRate || it.ratePerUnit || 0,
        days: it.rentalDays || totalDays,
        amount: (it.dailyRate || it.ratePerUnit || 0) * (it.quantity || 1) * (it.rentalDays || totalDays)
      });
    });
  }

  if (record.accessories && record.accessories.length > 0) {
    record.accessories.forEach((acc) => {
      items.push({
        name: `${acc.number ? `[${acc.number}] ` : ''}Accessory: ${acc.name}`,
        qty: acc.quantity || 1,
        rate: acc.price || 0,
        days: totalDays,
        amount: (acc.price || 0) * (acc.quantity || 1) * totalDays
      });
    });
  }

  // Support transport charges in table if present
  const transportCharge = Number(record.transportCharge || 0);
  const extraCharges = Number(record.otherCharges || record.extraCharges || record.mandatoryCharge || 0);
  const discount = Number(record.discount || 0);
  const securityDeposit = Number(record.refundableDeposit || record.securityDeposit || record.deposit || 0);
  const totalAmount = Number(record.totalAmount || record.estimatedTotal || 0);
  const advancePayment = Number(record.advancePayment || 0);
  const balanceAmount = Number(record.balanceAmount || (totalAmount - advancePayment));

  // Determine main daily rate for printing in terms clause 1
  const mainDailyRate = items.length > 0 ? items[0].rate : (record.dailyRate || 0);

  const printWindow = window.open('', '_blank', 'width=900,height=950');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${isInvoice ? 'Invoice' : 'Quotation'} - ${docNo}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Noto+Sans+Sinhala:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', 'Noto Sans Sinhala', sans-serif;
      background-color: #f1f5f9;
      color: #333;
    }
    body.si {
      font-family: 'Noto Sans Sinhala', sans-serif;
    }
    .no-print-bar {
      position: sticky;
      top: 0;
      background: #1e293b;
      color: white;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 10000;
      font-family: 'Inter', sans-serif;
    }
    .btn-lang {
      background: #475569;
      color: white;
      border: 1px solid #64748b;
      padding: 8px 16px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    .btn-lang.active {
      background: #3b82f6;
      border-color: #3b82f6;
    }
    .btn-action {
      background: #10b981;
      color: white;
      border: none;
      padding: 8px 16px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      margin-left: 8px;
    }
    .btn-action:hover {
      opacity: 0.9;
    }
    .paper-container {
      padding: 20px 0;
      display: flex;
      justify-content: center;
    }
    .receipt-paper {
      background: white;
      width: 210mm;
      min-height: 297mm;
      padding: 15mm;
      box-sizing: border-box;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      border: 1px solid #cbd5e1;
      display: flex;
      flex-direction: column;
    }
    @media print {
      .no-print-bar {
        display: none !important;
      }
      body {
        background-color: white !important;
      }
      .receipt-paper {
        border: none !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 5mm !important;
        width: 100% !important;
        max-width: 100% !important;
        min-height: auto !important;
      }
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .header-logo-cell {
      width: 60%;
      vertical-align: top;
    }
    .header-info-cell {
      width: 40%;
      text-align: right;
      vertical-align: top;
      font-size: 12px;
      line-height: 1.5;
    }
    .company-name {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px 0;
      letter-spacing: -0.5px;
    }
    .company-sub {
      font-size: 13px;
      font-weight: bold;
      color: #475569;
      margin: 0;
    }
    .doc-number {
      font-size: 22px;
      color: #dc2626;
      font-weight: 800;
      margin-top: 8px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      margin-bottom: 12px;
      font-size: 13px;
    }
    .meta-line {
      margin-bottom: 6px;
    }
    .meta-label {
      font-weight: bold;
    }
    .meta-value {
      border-bottom: 1px dotted #334155;
      padding-left: 6px;
      display: inline-block;
      min-width: 140px;
    }
    .agreement-bar {
      background: #000;
      color: #fff;
      padding: 8px 12px;
      font-weight: bold;
      font-size: 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      border-radius: 2px;
    }
    .agreement-text {
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .time-banner-text {
      font-size: 11px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .items-table th, .items-table td {
      border: 1px solid #000;
      padding: 8px;
      font-size: 12px;
      color: #000;
    }
    .items-table th {
      background: #f1f5f9;
      font-weight: 700;
      text-align: center;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .empty-row td {
      height: 25px;
    }
    .summary-label {
      font-weight: bold;
      text-align: right;
    }
    .summary-val {
      font-weight: bold;
      text-align: right;
    }
    .bottom-section {
      display: flex;
      margin-top: auto;
      gap: 15px;
      font-size: 11px;
      line-height: 1.5;
    }
    .terms-block {
      width: 76%;
    }
    .terms-clause {
      margin-bottom: 6px;
      text-align: justify;
    }
    .warning-block {
      width: 24%;
    }
    .warning-box {
      border: 2px solid #000;
      padding: 10px 6px;
      text-align: center;
      font-weight: bold;
      font-size: 10.5px;
      border-radius: 4px;
      line-height: 1.4;
      background: #f8fafc;
    }
    .signatures-block {
      display: flex;
      justify-content: space-between;
      margin-top: 25px;
      font-size: 11.5px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 15px;
    }
    .sig-col {
      width: 48%;
    }
    .sig-title {
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 12px;
    }
    .sig-line {
      margin-bottom: 8px;
    }
  </style>
</head>
<body class="si">

  <!-- Screen Only Language Selector Control Bar -->
  <div class="no-print-bar">
    <div style="font-weight: bold; font-size: 15px;">🦁 Lion Engineering & Tool Rent — Invoice Viewer</div>
    <div style="display: flex; gap: 8px;">
      <button id="btn-si" class="btn-lang active" onclick="switchLanguage('si')">සිංහල (Sinhala)</button>
      <button id="btn-en" class="btn-lang" onclick="switchLanguage('en')">English</button>
      <button class="btn-action" onclick="window.print()" style="background: #2563eb;">Print / Print to PDF</button>
      <button class="btn-action" onclick="downloadDirectPDF()">Download PDF File</button>
    </div>
  </div>

  <div class="paper-container">
    <div class="receipt-paper" id="receipt-paper">
      
      <!-- Header -->
      <table class="header-table">
        <tr>
          <td class="header-logo-cell">
            <h1 class="company-name" id="company-title">LION ENGINEERING & TOOL RENT</h1>
            <p class="company-sub" id="company-subtitle">Professional Equipment & Tools Rental Services</p>
          </td>
          <td class="header-info-cell">
            <div id="company-address" style="white-space: pre-line;">No : 51/A Veralupitiya Road,\nSithagama Avissawella.\nTel : 0772138344 / 077 9873051\nReg No : 00172</div>
            <div class="doc-number" id="doc-id">${docNo}</div>
          </td>
        </tr>
      </table>

      <!-- Meta Grid -->
      <div class="meta-grid">
        <div>
          <div class="meta-line">
            <span class="meta-label" id="lbl-taken-date">උපකරණ රැගෙන ගිය දිනය :</span>
            <span class="meta-value">${pickupDateFormatted}</span>
          </div>
          <div class="meta-line">
            <span class="meta-label" id="lbl-return-date">උපකරණ භාරදුන් දිනය :</span>
            <span class="meta-value">${returnDateFormatted}</span>
          </div>
          <div class="meta-line">
            <span class="meta-label" id="lbl-time">වේලාව :</span>
            <span class="meta-value">....................................</span>
          </div>
        </div>
        <div style="text-align: right; font-size: 13px;">
          <div class="meta-line">
            <span class="meta-label" id="lbl-cust-name">Customer:</span>
            <span style="font-weight: bold;">${clientName}</span>
          </div>
          ${clientPhone ? `<div class="meta-line">
            <span class="meta-label" id="lbl-cust-phone">Phone:</span>
            <span>${clientPhone}</span>
          </div>` : ''}
          ${clientNic ? `<div class="meta-line">
            <span class="meta-label" id="lbl-cust-nic">NIC:</span>
            <span>${clientNic}</span>
          </div>` : ''}
          ${clientAddress ? `<div class="meta-line">
            <span class="meta-label" id="lbl-cust-addr">Address:</span>
            <span>${clientAddress}</span>
          </div>` : ''}
        </div>
      </div>

      <!-- Agreement Ribbon -->
      <div class="agreement-bar">
        <span class="agreement-text" id="lbl-agreement">උපකරණ කුලී පදනම මත රැගෙන යාමේ ගිවිසුම.</span>
        <span class="time-banner-text" id="lbl-time-banner">දිනය කාලය පෙ.ව 8.00 සිට ප.ව. 5.00 දක්වා</span>
      </div>

      <!-- Items Table -->
      <table class="items-table" id="items-table">
        <thead>
          <tr>
            <th id="th-item" style="width: 45%;">උපකරණ</th>
            <th id="th-qty" style="width: 10%;">ප්‍රමාණය</th>
            <th id="th-days" style="width: 10%;">දින</th>
            <th id="th-rate" style="width: 15%;">දිනක කුලිය</th>
            <th id="th-amount" style="width: 20%;">මුළු මුදල රුපියල්</th>
          </tr>
        </thead>
        <tbody>
          <!-- Dynamic Items inserted here -->
        </tbody>
      </table>

      <!-- Bottom Terms & warning -->
      <div class="bottom-section">
        <div class="terms-block">
          <div class="terms-clause" id="clause-1"></div>
          <div class="terms-clause" id="clause-2"></div>
          <div class="terms-clause" id="clause-3"></div>
          <div class="terms-clause" id="clause-4"></div>
          <div class="terms-clause" id="clause-5"></div>
        </div>
        <div class="warning-block">
          <div class="warning-box" id="warning-box-text"></div>
        </div>
      </div>

      <!-- Signatures -->
      <div class="signatures-block">
        <div class="sig-col">
          <div class="sig-title" id="lbl-handover-header">උපකරණ භාරදෙන විට</div>
          <div class="sig-line" id="lbl-handover-sig">ගණුදෙනුකරුගේ අත්සන : .............................................</div>
          <div class="sig-line" id="lbl-handover-address">අත්සන්කරුගේ ලිපිනය හා දු.අංකය : .............................................</div>
          <div class="sig-line" id="lbl-handover-nic">ජා.හැ. අංකය : .............................................</div>
        </div>
        <div class="sig-col" style="text-align: right;">
          <div class="sig-title" id="lbl-return-header" style="text-align: right;">උපකරණ නැවත භාර ගැනීමේදී</div>
          <div class="sig-line" id="lbl-return-sig">ගණුදෙනුකරුගේ අත්සන : .............................................</div>
          <div class="sig-line" id="lbl-return-name">නම : .............................................</div>
          <div class="sig-line" id="lbl-return-address">ලිපිනය : .............................................</div>
          <div class="sig-line" id="lbl-return-phone">දු.ක අංකය : .............................................</div>
        </div>
      </div>

    </div>
  </div>

  <!-- CDN scripts loaded off-screen for Direct Canvas printing -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

  <script>
    const TRANSLATIONS = {
      si: {
        title: "LION ENGINEERING & TOOL RENT",
        subtitle: "වෘත්තීය මට්ටමේ උපකරණ සහ මෙවලම් කුලියට දීම",
        address: "නො. 51/A වේරළුපිටිය පාර,\\nසීතගම, අවිස්සාවේල්ල.\\nදු.ක: 0772138344 / 077 9873051\\nලියාපදිංචි අංකය: 00172",
        takenDate: "උපකරණ රැගෙන ගිය දිනය :",
        returnDate: "උපකරණ භාරදුන් දිනය :",
        time: "වේලාව :",
        agreement: "උපකරණ කුලී පදනම මත රැගෙන යාමේ ගිවිසුම.",
        timeBanner: "දිනය කාලය පෙ.ව 8.00 සිට ප.ව. 5.00 දක්වා",
        colItem: "උපකරණ",
        colQty: "ප්‍රමාණය",
        colRate: "දිනක කුලිය",
        colAmount: "මුළු මුදල රුපියල්",
        colDays: "දින",
        subtotal: "උපකරණ කුලී එකතුව",
        discount: "වට්ටම් (Discount)",
        deposit: "ආරක්ෂක තැන්පතු (Security Deposit)",
        grandTotal: "GRAND TOTAL (මුළු මුදල)",
        advance: "ADVANCE (අත්තිකාරම් ගෙවීම්)",
        balanceDue: "BALANCE DUE (ගෙවිය යුතු ඉතිරි මුදල)",
        clause1: "01. දිනකට / කුලිය වශයෙන් රු. {rate} බැගින් උපකරණ රැගෙන ගිය දිනයද, ආපසු භාර දෙන දිනයද ඇතුළුව උපකරණය ගණුදෙනුකරු / භාරකරු භාරයේ තබාගන්නා කාලය සදහා කුලී මුදල්, උපකරණ ආපසු භාරදෙන අවස්ථාවේදී සම්පූර්ණයෙන්ම පියවීමට ගණුදෙනුකරු බැදී සිටී.",
        clause2: "02. ඔබ තබන තැන්පතු මුදල් වලංගු වන්නේ දින 10 ක කාලයක් පමණි.",
        clause3: "03. උපකරණ ගණුදෙනුකරු භාරයට ගත් පසු අප ආයතනයෙන් භාරගන්නා අවස්ථාව දක්වා උපකරණයට සිදුවන හානි සදහා ගණුදෙනුකරු වගකීමට බැදී සිටී.",
        clause4: "04. යම් ආකාරයකින් උපකරණය නැති වුවහොත් ඒ සදහා නව උපකරණයක් සැපයීමට හෝ එම උපකරණයේ මිලට සමාන මුදලක් සමාගමට ගෙවීමට ගණුදෙනුකරු බැදී සිටී.",
        clause5: "05. උපකරණය රැගෙන යාමේදී මූලික තැන්පතු මුදල ලෙස රු. {deposit} ක මුදලක් ගෙවා රිසිට් පතක් ලබා ගත යුතු අතර යන්ත්‍රය ආපසු භාරදෙන අවස්ථාවේදී එය ආයතනයට ඉදිරිපත් කළ යුතුය. (තැන්පත් මුදලින් කුලී සදහා අඩු කර ගත් පසු ඉතිරි මුදලක් වේ නම් එය ආපසු ගෙවීමේදී තැන්පතු මුදල දුන් තැනැත්තා රිසිට් පත ඉදිරිපත් නොකරන අවස්ථා වලදී ගෙවීම් ප්‍රතික්ෂේප කරනු ලැබේ.)",
        warning: "කුලියට නොයන<br>උපකරණ<br>පෙ.ව 8.30ට පෙර<br>භාර දෙන්න.<br>ඉන්පසු භාරදෙන<br>උපකරණ සදහා<br>දිනයක්<br>අය කිරීමට<br>සිදුවනු ඇත.",
        handoverHeader: "උපකරණ භාරදෙන විට",
        handoverSig: "ගණුදෙනුකරුගේ අත්සන : .............................................",
        handoverAddress: "අත්සන්කරුගේ ලිපිනය හා දු.අංකය : .............................................",
        handoverNic: "ජා.හැ. අංකය : .............................................",
        returnHeader: "උපකරණ නැවත භාර ගැනීමේදී",
        returnSig: "ගණුදෙනුකරුගේ අත්සන : .............................................",
        returnName: "නම : .............................................",
        returnAddress: "ලිපිනය : .............................................",
        returnPhone: "දු.ක අංකය : ............................................."
      },
      en: {
        title: "LION ENGINEERING & TOOL RENT",
        subtitle: "Professional Equipment & Tools Rental Services",
        address: "No : 51/A Veralupitiya Road,\\nSithagama Avissawella.\\nTel : 0772138344 / 077 9873051\\nReg No : 00172",
        takenDate: "Equipment Handover Date :",
        returnDate: "Equipment Return Date :",
        time: "Time :",
        agreement: "Equipment Rental Agreement & Contract",
        timeBanner: "Date/Time: 8:00 AM to 5:00 PM",
        colItem: "Equipment / Description",
        colQty: "Qty",
        colRate: "Rate/Day",
        colAmount: "Amount (LKR)",
        colDays: "Days",
        subtotal: "Rental Items Subtotal",
        discount: "Discount Given",
        deposit: "Refundable Security Deposit",
        grandTotal: "GRAND TOTAL",
        advance: "ADVANCE PAYMENT",
        balanceDue: "BALANCE DUE",
        clause1: "01. The customer/custodian is bound to pay the rental amount at LKR {rate} per day from the date of rental until the date of return, and settle full payment upon equipment handover.",
        clause2: "02. The security deposit paid by you is valid for a maximum period of 10 days only.",
        clause3: "03. Once the equipment is received by the customer, the customer is fully responsible and liable for any damages to the equipment until returned.",
        clause4: "04. In case the equipment is lost, the customer is bound to provide a new replacement or pay the full replacement value of the equipment.",
        clause5: "05. A receipt must be obtained upon paying the initial deposit of LKR {deposit}. This receipt must be presented when returning the machine to process any refund. Refunds will be rejected if the receipt is not presented.",
        warning: "Please return<br>unused tools<br>before 8:30 AM.<br>Otherwise,<br>an additional<br>day's rent<br>will be charged<br>automatically.",
        handoverHeader: "During Handover",
        handoverSig: "Customer Signature: .............................................",
        handoverAddress: "Signatory Address & Tel: .............................................",
        handoverNic: "NIC / ID Number: .............................................",
        returnHeader: "During Return",
        returnSig: "Customer Signature: .............................................",
        returnName: "Name: .............................................",
        returnAddress: "Address: .............................................",
        returnPhone: "Tel Number: ............................................."
      }
    };

    const items = ${JSON.stringify(items)};
    const dailyRateDisplay = ${mainDailyRate};
    const depositDisplay = ${securityDeposit};
    const subtotalVal = ${items.reduce((sum, i) => sum + i.amount, 0)};
    const transportVal = ${transportCharge};
    const extraVal = ${extraCharges};
    const discountVal = ${discount};
    const depositVal = ${securityDeposit};
    const grandVal = ${totalAmount};
    const advanceVal = ${advancePayment};
    const balanceVal = ${balanceAmount};
    
    let currentLang = 'si';

    function buildTable(lang) {
      const tbody = document.querySelector('#items-table tbody');
      tbody.innerHTML = '';

      // 1. Render actual items
      items.forEach(it => {
        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td class="text-left font-bold">\${it.name}</td>
          <td class="text-center">\${it.qty}</td>
          <td class="text-center">\${it.days}</td>
          <td class="text-right">\${it.rate.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          <td class="text-right">\${it.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        \`;
        tbody.appendChild(tr);
      });

      // 2. Pad table to exactly 6 rows to look like the physical paper receipt book
      const minRows = 6;
      let currentRowsCount = items.length;
      while (currentRowsCount < minRows) {
        const tr = document.createElement('tr');
        tr.className = 'empty-row';
        tr.innerHTML = \`
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        \`;
        tbody.appendChild(tr);
        currentRowsCount++;
      }

      // 3. Render extra charges & summary totals
      const summaryItems = [
        { labelId: 'total-subtotal-lbl', val: subtotalVal },
        ...(transportVal > 0 ? [{ labelText: lang === 'si' ? 'ප්‍රවාහන ගාස්තු (Transport)' : 'Transport Charges', val: transportVal }] : []),
        ...(extraVal > 0 ? [{ labelText: lang === 'si' ? 'වෙනත් ගාස්තු (Other Charges)' : 'Other Charges', val: extraVal }] : []),
        ...(depositVal > 0 ? [{ labelId: 'total-deposit-lbl', val: depositVal }] : []),
        ...(discountVal > 0 ? [{ labelId: 'total-discount-lbl', val: -discountVal }] : []),
        { labelId: 'total-grand-lbl', val: grandVal, isGrand: true },
        { labelId: 'total-advance-lbl', val: advanceVal },
        { labelId: 'total-balance-lbl', val: balanceVal, isBalance: true }
      ];

      summaryItems.forEach(item => {
        const tr = document.createElement('tr');
        let label = item.labelText || '';
        let style = 'font-weight:bold;';
        
        if (item.isGrand) {
          style += 'font-size:14px;background:#e2e8f0;border-top:2px solid #000;';
        }
        if (item.isBalance) {
          style += 'font-size:14px;color:#dc2626;background:#fef2f2;';
        }

        tr.innerHTML = \`
          <td colspan="3" class="summary-label" style="\${style}" id="\${item.labelId || ''}">\${label}</td>
          <td colspan="2" class="summary-val" style="\${style}">LKR \${item.val.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function switchLanguage(lang) {
      currentLang = lang;
      
      // Update buttons active state
      document.getElementById('btn-si').classList.toggle('active', lang === 'si');
      document.getElementById('btn-en').classList.toggle('active', lang === 'en');

      const trans = TRANSLATIONS[lang];

      // Update Header & Address
      document.getElementById('company-title').innerText = trans.title;
      document.getElementById('company-subtitle').innerText = trans.subtitle;
      document.getElementById('company-address').innerText = trans.address;

      // Update Labels
      document.getElementById('lbl-taken-date').innerText = trans.takenDate;
      document.getElementById('lbl-return-date').innerText = trans.returnDate;
      document.getElementById('lbl-time').innerText = trans.time;
      document.getElementById('lbl-agreement').innerText = trans.agreement;
      document.getElementById('lbl-time-banner').innerText = trans.timeBanner;

      // Update Table Headers
      document.getElementById('th-item').innerText = trans.colItem;
      document.getElementById('th-qty').innerText = trans.colQty;
      document.getElementById('th-days').innerText = trans.colDays;
      document.getElementById('th-rate').innerText = trans.colRate;
      document.getElementById('th-amount').innerText = trans.colAmount;

      // Update Bottom Clauses
      document.getElementById('clause-1').innerText = trans.clause1.replace('{rate}', dailyRateDisplay.toLocaleString('en-US', {minimumFractionDigits: 2}));
      document.getElementById('clause-2').innerText = trans.clause2;
      document.getElementById('clause-3').innerText = trans.clause3;
      document.getElementById('clause-4').innerText = trans.clause4;
      document.getElementById('clause-5').innerText = trans.clause5.replace('{deposit}', depositDisplay.toLocaleString('en-US', {minimumFractionDigits: 2}));

      // Update Warning box text
      document.getElementById('warning-box-text').innerHTML = trans.warning;

      // Update Signatures
      document.getElementById('lbl-handover-header').innerText = trans.handoverHeader;
      document.getElementById('lbl-handover-sig').innerText = trans.handoverSig;
      document.getElementById('lbl-handover-address').innerText = trans.handoverAddress;
      document.getElementById('lbl-handover-nic').innerText = trans.handoverNic;

      document.getElementById('lbl-return-header').innerText = trans.returnHeader;
      document.getElementById('lbl-return-sig').innerText = trans.returnSig;
      document.getElementById('lbl-return-name').innerText = trans.returnName;
      document.getElementById('lbl-return-address').innerText = trans.returnAddress;
      document.getElementById('lbl-return-phone').innerText = trans.returnPhone;

      // Set HTML class for Sinhala font
      document.body.className = lang;

      // Rebuild Table
      buildTable(lang);
    }

    // Direct High-Resolution Canvas PDF generator inside printable window
    function downloadDirectPDF() {
      const { jsPDF } = window.jspdf;
      const element = document.getElementById('receipt-paper');
      
      html2canvas(element, {
        scale: 2.5, // Crisp lines
        useCORS: true
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        pdf.save(\`Receipt_\${docNo || 'Draft'}.pdf\`);
      });
    }

    // Auto load Sinhala on startup
    switchLanguage('si');
  </script>
</body>
</html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const generateInvoicePDF = async (invoice, mode = 'download') => {
  // Directly open unified language toggling window
  openPrintWindow(invoice, 'invoice');
};

export const generateQuotationPDF = async (quote, mode = 'download') => {
  // Directly open unified language toggling window
  openPrintWindow(quote, 'quotation');
};
