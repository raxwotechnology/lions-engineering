import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Phone,
  MapPin,
  Building,
  Shield,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Mail,
  FileText,
  Sparkles,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const Profile = () => {
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: user?.companyName || '',
    nicOrPassport: user?.nicOrPassport || '',
    streetAddress: user?.address?.streetAddress || user?.address?.street || '',
    city: user?.address?.city || '',
    district: user?.address?.district || '',
    postalCode: user?.address?.postalCode || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        companyName: user.companyName || '',
        nicOrPassport: user.nicOrPassport || '',
        streetAddress: user.address?.streetAddress || user.address?.street || '',
        city: user.address?.city || '',
        district: user.address?.district || '',
        postalCode: user.address?.postalCode || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'New password and confirm password do not match.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || token || ''}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          name: formData.fullName,
          phone: formData.phone,
          companyName: formData.companyName,
          nicOrPassport: formData.nicOrPassport,
          address: {
            streetAddress: formData.streetAddress,
            street: formData.streetAddress,
            city: formData.city,
            district: formData.district,
            postalCode: formData.postalCode
          },
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const toastMsg = data.message || 'Profile details updated successfully!';
        setStatus({ type: 'success', message: toastMsg });
        if (data.user) {
          localStorage.setItem('user', JSON.stringify({ ...user, ...data.user }));
        }
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Server error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const userInitial = (formData.fullName || user?.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* 1. TOP PROFILE HEADER BANNER */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            {userInitial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">{formData.fullName || 'User Account'}</h2>
              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-amber-500/30">
                {user?.role || 'Customer'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span>{formData.email}</span> • <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Verified Profile</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all shrink-0"
        >
          <Save className="w-4 h-4 stroke-[2.5]" /> {loading ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </div>

      {/* TOAST NOTIFICATION STATUS */}
      {status.message && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-lg ${
          status.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* CARD 1: PERSONAL & BUSINESS CONTACT DETAILS */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Personal & Business Contact Details</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Update primary name, contact phone, and company affiliation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. David Miller"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Email Address (Read Only)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-500 dark:text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Phone Number (Mobile / WhatsApp)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+94 77 123 4567"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">NIC / Passport Number</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.nicOrPassport}
                  onChange={(e) => setFormData({ ...formData, nicOrPassport: e.target.value })}
                  placeholder="e.g. 1992102948V / N883019"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Company / Organization Name (Optional)</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. BuildTech Constructions Lanka LLC"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: EQUIPMENT DELIVERY & SITE ADDRESS */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Equipment Delivery & Site Address</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Primary delivery address for tool dispatch logistics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Street Address / Site Location</label>
              <input
                type="text"
                value={formData.streetAddress}
                onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                placeholder="e.g. No. 45, Galle Road, Kollupitiya"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Colombo"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="Colombo / Gampaha / Kandy"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Postal Code</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="00300"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* CARD 3: SECURITY & PASSWORD MANAGEMENT */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Security & Password Management</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Leave blank if you do not wish to update your login password</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Current Password</label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">New Password</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* PRIMARY SAVE ACTION BUTTON */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black px-8 py-3.5 rounded-xl text-xs flex items-center gap-2 shadow-xl shadow-amber-500/30 hover:scale-[1.01] transition-all"
          >
            <Save className="w-4 h-4 stroke-[2.5]" /> {loading ? 'SAVING PROFILE...' : 'SAVE PROFILE CHANGES'}
          </button>
        </div>
      </form>
    </div>
  );
};
