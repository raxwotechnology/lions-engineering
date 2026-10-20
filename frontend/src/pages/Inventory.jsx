import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../services/api';
import {
  Package, Plus, Search, Edit2, Trash2, AlertTriangle,
  ChevronDown, X, Check, RefreshCw, TrendingUp, TrendingDown,
  Archive, Filter, BarChart2, Tag, ShoppingCart, Boxes
} from 'lucide-react';

const CATEGORIES = ['All', 'Hardware', 'Hand Tools', 'Fasteners', 'Electrical', 'Plumbing', 'Safety', 'Cleaning', 'Garden', 'General'];
const UNITS = ['pcs', 'kg', 'g', 'L', 'm', 'ft', 'box', 'bag', 'roll', 'set', 'pair'];

const emptyForm = {
  name: '', category: 'Hardware', description: '', unit: 'pcs',
  buyingPrice: '', sellingPrice: '', stock: '', minStockAlert: 10,
  supplier: '', barcode: '', status: 'Active'
};

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-xl font-black text-slate-100">{value}</p>
        {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(null); // product object
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [stockAdj, setStockAdj] = useState({ operation: 'add', adjustment: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const data = await fetchApi('/products', {}, { success: true, products: [] });
    if (data?.success) setProducts(data.products || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter(p => {
    const matchCat = catFilter === 'All' || p.category === catFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.productCode || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const lowStockCount = products.filter(p => p.stock <= p.minStockAlert).length;
  const totalValue = products.reduce((s, p) => s + (p.stock * p.buyingPrice), 0);
  const totalItems = products.reduce((s, p) => s + p.stock, 0);

  const openAdd = () => { setEditProduct(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name, category: p.category, description: p.description || '',
      unit: p.unit, buyingPrice: p.buyingPrice, sellingPrice: p.sellingPrice,
      stock: p.stock, minStockAlert: p.minStockAlert, supplier: p.supplier || '',
      barcode: p.barcode || '', status: p.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, buyingPrice: +form.buyingPrice, sellingPrice: +form.sellingPrice, stock: +form.stock, minStockAlert: +form.minStockAlert };
    let data;
    if (editProduct) {
      data = await fetchApi(`/products/${editProduct._id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      data = await fetchApi('/products', { method: 'POST', body: JSON.stringify(payload) });
    }
    if (data?.success) {
      showToast(editProduct ? 'Product updated!' : 'Product added!');
      fetchProducts();
      setShowModal(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const data = await fetchApi(`/products/${id}`, { method: 'DELETE' });
    if (data?.success) { showToast('Product deleted'); fetchProducts(); }
  };

  const handleStockAdj = async () => {
    if (!stockAdj.adjustment) return;
    setSaving(true);
    const data = await fetchApi(`/products/${showStockModal._id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ operation: stockAdj.operation, adjustment: +stockAdj.adjustment })
    });
    if (data?.success) {
      showToast('Stock updated!');
      fetchProducts();
      setShowStockModal(null);
    }
    setSaving(false);
  };

  const inp = "w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-amber-500/60 placeholder-slate-500";
  const lbl = "block text-xs font-semibold text-slate-400 mb-1";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-400" /> Stock Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage products, stock levels & pricing</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Package} label="Total Products" value={products.length} color="bg-blue-500/20 text-blue-400" />
        <StatCard icon={Boxes} label="Total Stock Units" value={totalItems.toLocaleString()} color="bg-emerald-500/20 text-emerald-400" />
        <StatCard icon={AlertTriangle} label="Low Stock Alerts" value={lowStockCount} color="bg-rose-500/20 text-rose-400" sub="Below minimum threshold" />
        <StatCard icon={TrendingUp} label="Stock Value" value={`Rs. ${totalValue.toLocaleString()}`} color="bg-amber-500/20 text-amber-400" sub="At buying price" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${catFilter === c ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
            <RefreshCw className="w-5 h-5 animate-spin" /> Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <Package className="w-10 h-10 opacity-30" />
            <p className="font-semibold">No products found</p>
            <button onClick={openAdd} className="text-amber-400 text-xs hover:underline">+ Add first product</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Code', 'Product', 'Category', 'Unit', 'Buy Price', 'Sell Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(p => {
                  const isLow = p.stock <= p.minStockAlert;
                  return (
                    <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-amber-400 font-bold">{p.productCode || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-200">{p.name}</div>
                        {p.description && <div className="text-slate-500 text-[10px] truncate max-w-36">{p.description}</div>}
                      </td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-500/15 text-blue-300 rounded-lg font-semibold">{p.category}</span></td>
                      <td className="px-4 py-3 text-slate-400">{p.unit}</td>
                      <td className="px-4 py-3 text-slate-300">Rs. {(p.buyingPrice || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-emerald-400 font-bold">Rs. {(p.sellingPrice || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-black text-sm ${isLow ? 'text-rose-400' : 'text-slate-200'}`}>{p.stock}</span>
                          {isLow && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                        </div>
                        <div className="text-[10px] text-slate-500">min: {p.minStockAlert}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-lg font-semibold text-[10px] ${p.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setShowStockModal(p); setStockAdj({ operation: 'add', adjustment: '' }); }}
                            className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors" title="Adjust Stock">
                            <TrendingUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="font-black text-slate-100 text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={lbl}>Product Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Nails 2 inch, Spade Handle..." className={inp} />
                </div>
                <div>
                  <label className={lbl}>Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inp}>
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Unit</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className={inp}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Buying Price (Rs.) *</label>
                  <input required type="number" min="0" value={form.buyingPrice} onChange={e => setForm({ ...form, buyingPrice: e.target.value })} placeholder="0" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Selling Price (Rs.) *</label>
                  <input required type="number" min="0" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} placeholder="0" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Current Stock</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Min Stock Alert</label>
                  <input type="number" min="0" value={form.minStockAlert} onChange={e => setForm({ ...form, minStockAlert: e.target.value })} placeholder="10" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Supplier</label>
                  <input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inp}>
                    <option>Active</option><option>Inactive</option><option>Discontinued</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Optional product description..." className={inp} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm flex items-center gap-2 disabled:opacity-60">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editProduct ? 'Update' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="font-black text-slate-100 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Adjust Stock
              </h2>
              <button onClick={() => setShowStockModal(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-800 rounded-xl p-3">
                <p className="font-bold text-slate-200 text-sm">{showStockModal.name}</p>
                <p className="text-xs text-slate-400">Current Stock: <span className="text-amber-400 font-black">{showStockModal.stock} {showStockModal.unit}</span></p>
              </div>
              <div>
                <label className={lbl}>Operation</label>
                <div className="grid grid-cols-3 gap-2">
                  {['add', 'subtract', 'set'].map(op => (
                    <button key={op} type="button" onClick={() => setStockAdj({ ...stockAdj, operation: op })}
                      className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${stockAdj.operation === op ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                      {op === 'add' ? '+ Add' : op === 'subtract' ? '- Remove' : '= Set'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={lbl}>Quantity</label>
                <input type="number" min="1" value={stockAdj.adjustment} onChange={e => setStockAdj({ ...stockAdj, adjustment: e.target.value })} placeholder="Enter quantity..." className={inp} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowStockModal(null)} className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold">Cancel</button>
                <button onClick={handleStockAdj} disabled={saving} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm disabled:opacity-60">
                  {saving ? 'Saving...' : 'Update Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] bg-emerald-500 text-slate-950 font-black px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs">
          <Check className="w-4 h-4" /> {toast}
        </div>
      )}
    </div>
  );
}
