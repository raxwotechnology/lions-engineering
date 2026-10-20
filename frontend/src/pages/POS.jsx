import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchApi } from '../services/api';
import {
  ShoppingCart, Search, Plus, Minus, Trash2, X, Check,
  Printer, User, Package, CreditCard, Banknote, Phone,
  RefreshCw, Receipt, ChevronRight, Tag, Zap, AlertTriangle,
  TrendingUp, Calendar, Hash
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

function InvoicePrint({ sale, onClose }) {
  const printRef = useRef();
  const handlePrint = () => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Invoice ${sale.invoiceNumber}</title>
      <style>
        body { font-family: monospace; font-size: 12px; margin: 20px; color: #000; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        td, th { padding: 3px 0; text-align: left; font-size: 11px; }
        th { font-weight: bold; }
        .right { text-align: right; }
        .total-row { font-weight: bold; font-size: 13px; }
      </style></head><body>
      <div class="center bold" style="font-size:16px">LIONS ENGINEERING</div>
      <div class="center" style="font-size:10px">Tool Rental & Supply Store</div>
      <div class="line"></div>
      <div><b>Invoice #:</b> ${sale.invoiceNumber}</div>
      <div><b>Date:</b> ${new Date(sale.createdAt || Date.now()).toLocaleString()}</div>
      <div><b>Customer:</b> ${sale.customerName || 'Walk-in'}</div>
      ${sale.customerPhone ? `<div><b>Phone:</b> ${sale.customerPhone}</div>` : ''}
      <div class="line"></div>
      <table>
        <tr><th>Item</th><th>Qty</th><th>Price</th><th class="right">Total</th></tr>
        ${sale.items.map(i => `<tr><td>${i.productName}</td><td>${i.qty} ${i.unit || ''}</td><td>Rs.${i.sellingPrice}</td><td class="right">Rs.${i.total}</td></tr>`).join('')}
      </table>
      <div class="line"></div>
      <table>
        <tr><td>Subtotal</td><td class="right">Rs. ${sale.subtotal}</td></tr>
        ${sale.discount > 0 ? `<tr><td>Discount</td><td class="right">- Rs. ${sale.discount}</td></tr>` : ''}
        <tr class="total-row"><td>TOTAL</td><td class="right">Rs. ${sale.totalAmount}</td></tr>
        <tr><td>Paid (${sale.paymentMethod})</td><td class="right">Rs. ${sale.paidAmount}</td></tr>
        ${sale.changeAmount > 0 ? `<tr><td>Change</td><td class="right">Rs. ${sale.changeAmount}</td></tr>` : ''}
      </table>
      <div class="line"></div>
      <div class="center">Thank you for your purchase!</div>
      <div class="center" style="font-size:9px">Powered by Lions Engineering System</div>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="font-black text-slate-100 flex items-center gap-2"><Receipt className="w-5 h-5 text-emerald-400" /> Sale Complete!</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
            <Check className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="font-black text-slate-100 text-lg">Rs. {(sale.totalAmount || 0).toLocaleString()}</p>
            <p className="text-xs text-emerald-400 font-semibold">{sale.paymentMethod} · {sale.paymentStatus}</p>
            <p className="text-[10px] text-slate-500 mt-1">Invoice: {sale.invoiceNumber}</p>
          </div>
          {sale.changeAmount > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400">Change to return</p>
              <p className="font-black text-amber-400 text-xl">Rs. {sale.changeAmount.toLocaleString()}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-700 text-slate-400 rounded-xl font-semibold text-sm">New Sale</button>
            <button onClick={handlePrint} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2">
              <Printer className="w-4 h-4" /> Print Invoice
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

  const handleCheckout = async () => {
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
    } else {
      alert(data?.message || 'Sale failed. Check stock availability.');
    }
    setProcessing(false);
  };

  const inp = "w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-amber-500/60 placeholder-slate-500";

  if (loading) return (
    <div className="flex items-center justify-center min-h-64 text-slate-400 gap-3">
      <RefreshCw className="w-5 h-5 animate-spin" /> Loading POS...
    </div>
  );

  return (
    <div className="space-y-4">
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
        {/* LEFT: Products Grid */}
        <div className="xl:col-span-2 space-y-3">
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

        {/* RIGHT: Cart & Checkout */}
        <div className="space-y-3">
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
              {cart.length > 0 && <button onClick={clearCart} className="text-[10px] text-rose-400 hover:underline">Clear all</button>}
            </div>
            {cart.length === 0 ? (
              <p className="text-center text-slate-500 text-xs py-6">Click products to add to cart</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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

              {/* Checkout Button */}
              <button onClick={handleCheckout} disabled={processing || cart.length === 0}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-60 transition-all">
                {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                {processing ? 'Processing...' : `Complete Sale · Rs. ${totalAmount.toLocaleString()}`}
              </button>
            </div>
          )}

          {/* Recent Sales */}
          {recentSales.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-slate-400">Recent Sales</p>
              {recentSales.map(s => (
                <div key={s._id} className="flex items-center justify-between text-xs bg-slate-800 rounded-xl p-2.5">
                  <div>
                    <p className="font-mono text-amber-400 text-[10px]">{s.invoiceNumber}</p>
                    <p className="text-slate-400 text-[10px]">{s.customerName} · {s.items?.length} items</p>
                  </div>
                  <p className="font-black text-emerald-400">Rs. {s.totalAmount?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completed Sale Invoice Modal */}
      {completedSale && <InvoicePrint sale={completedSale} onClose={() => setCompletedSale(null)} />}
    </div>
  );
}
