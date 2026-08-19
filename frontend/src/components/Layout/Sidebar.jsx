import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../Common/Modal';
import {
  LayoutDashboard,
  Wrench,
  Grid,
  Users,
  CalendarCheck,
  Receipt,
  FileText,
  DollarSign,
  Truck,
  BarChart3,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  UserCog,
  Headphones,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  Crown,
  Shield,
  Zap,
  Flame
} from 'lucide-react';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState('');
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [savingLogo, setSavingLogo] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const currentRole = (user?.role || 'customer').toLowerCase();
  const isAdminOrOwner = currentRole === 'admin' || currentRole === 'owner' || currentRole === 'manager';

  // Visual Preset Brand Logos for 1-Click Selection by Owner
  const presetLogos = [
    {
      name: 'Golden Lions Crest',
      url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&auto=format&fit=crop&q=80',
      icon: Crown
    },
    {
      name: 'Industrial Heavy Machinery',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      icon: Flame
    },
    {
      name: 'Power Tools Shield',
      url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=150&auto=format&fit=crop&q=80',
      icon: Shield
    },
    {
      name: 'Precision Construction Gear',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&auto=format&fit=crop&q=80',
      icon: Zap
    }
  ];

  useEffect(() => {
    fetchLogoSettings();
  }, []);

  const fetchLogoSettings = () => {
    fetch('/api/settings/support')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.support && data.support.companyLogoUrl) {
          setLogoUrl(data.support.companyLogoUrl);
          setCustomUrlInput(data.support.companyLogoUrl);
        }
      })
      .catch(err => console.warn(err));
  };

  const handleSaveLogoToBackend = async (newUrl) => {
    setSavingLogo(true);
    try {
      const res = await fetch('/api/settings/support', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ companyLogoUrl: newUrl })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLogoUrl(newUrl);
        setToastMessage('Company logo updated live across the entire system!');
        setTimeout(() => setToastMessage(''), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingLogo(false);
    }
  };

  const handleLocalFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target.result;
      handleSaveLogoToBackend(base64Data);
      setIsLogoModalOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPresetLogo = (presetUrl) => {
    handleSaveLogoToBackend(presetUrl);
    setIsLogoModalOpen(false);
  };

  const handleApplyCustomUrl = (e) => {
    e.preventDefault();
    if (!customUrlInput) return;
    handleSaveLogoToBackend(customUrlInput);
    setIsLogoModalOpen(false);
  };

  const handleRemoveLogo = () => {
    handleSaveLogoToBackend('');
    setCustomUrlInput('');
    setIsLogoModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationSections = [
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'manager', 'customer', 'owner'] },
        { name: currentRole === 'customer' ? 'Tool Catalog' : 'Tool Inventory', path: '/tools', icon: Wrench, roles: ['admin', 'manager', 'customer', 'owner'] },
        { name: 'Tool Categories', path: '/categories', icon: Grid, roles: ['admin', 'manager', 'customer', 'owner'] },
        { name: currentRole === 'customer' ? 'My Rentals & Orders' : 'Reservations & Rentals', path: '/reservations', icon: currentRole === 'customer' ? ShoppingBag : CalendarCheck, roles: ['admin', 'manager', 'customer', 'owner'] }
      ]
    },
    {
      title: 'SALES & FINANCE',
      items: [
        { name: 'Transactions & Billing', path: '/transactions', icon: Receipt, roles: ['admin', 'manager', 'owner'] },
        { name: 'Rental Quotations', path: '/quotations', icon: FileText, roles: ['admin', 'manager', 'customer'] },
        { name: 'Financial Expenses', path: '/expenses', icon: DollarSign, roles: ['admin', 'manager'] },
        { name: 'Financial Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'manager'] }
      ]
    },
    {
      title: 'DIRECTORY',
      items: [
        { name: 'Customers Directory', path: '/customers', icon: Users, roles: ['admin', 'manager'] },
        { name: 'Suppliers Directory', path: '/suppliers', icon: Truck, roles: ['admin', 'manager'] }
      ]
    },
    {
      title: 'SETTINGS & SUPPORT',
      items: [
        { name: 'Profile & Account Settings', path: '/profile', icon: UserCog, roles: ['admin', 'manager', 'customer', 'owner'] },
        { name: 'Support & Hotline Settings', path: '/support-settings', icon: Headphones, roles: ['admin', 'manager'] }
      ]
    }
  ];

  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Owner Clickable Logo Selector */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div
            onClick={() => isAdminOrOwner && setIsLogoModalOpen(true)}
            className={`flex items-center gap-3 group transition-transform ${
              isAdminOrOwner ? 'cursor-pointer hover:opacity-90 active:scale-95' : ''
            }`}
            title={isAdminOrOwner ? 'Click to Change Company Brand Logo (Owner Feature)' : 'Lions Rentals'}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 overflow-hidden relative">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Wrench className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              )}
              {isAdminOrOwner && (
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-amber-400">
                  <Upload className="w-4 h-4" />
                </div>
              )}
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-slate-100 tracking-tight leading-none group-hover:text-amber-400 transition-colors">
                LIONS RENTALS
              </h1>
              <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase flex items-center gap-1">
                Sri Lanka Pro {isAdminOrOwner && <span className="text-[9px] text-slate-500 font-normal underline">Change Logo</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navigationSections.map((section) => {
            const visibleItems = section.items.filter(item => item.roles.includes(currentRole));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <div className="px-3 text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">
                  {section.title}
                </div>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-[11px] font-bold text-slate-200 leading-none truncate max-w-[110px]">{user?.name || 'User'}</p>
                <p className="text-[9px] text-slate-400 mt-0.5 capitalize">{currentRole} Mode</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* OWNER INTERACTIVE LOGO SELECTOR MODAL */}
      <Modal isOpen={isLogoModalOpen} onClose={() => setIsLogoModalOpen(false)} title="Owner Brand Logo Customizer">
        <div className="space-y-5 text-xs">
          
          {/* Active Logo Display Box */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-amber-500/20">
                {logoUrl ? (
                  <img src={logoUrl} alt="Active Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <Wrench className="w-7 h-7 text-slate-950 stroke-[2.5]" />
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-100 text-sm">Active System Brand Logo</h4>
                <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                  {logoUrl ? 'Custom Image Active' : 'Default Wrench Emblem Active'}
                </p>
              </div>
            </div>

            {logoUrl && (
              <button
                onClick={handleRemoveLogo}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl font-bold flex items-center gap-1 border border-rose-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" /> Reset Default
              </button>
            )}
          </div>

          {/* Option 1: Direct File Upload */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
            <label className="block text-slate-300 font-bold flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-amber-400" /> Option 1: Upload Any Logo File from Computer
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp, image/svg+xml"
              onChange={handleLocalFileUpload}
              className="hidden"
              id="sidebar-logo-upload"
            />
            <label
              htmlFor="sidebar-logo-upload"
              className="cursor-pointer w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" /> Choose Logo File (PNG, JPG, WEBP, SVG)
            </label>
          </div>

          {/* Option 2: Select From Preset Brand Logos */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <label className="block text-slate-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Option 2: Pick Visual Preset Brand Emblem
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {presetLogos.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPresetLogo(preset.url)}
                    className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl flex items-center gap-3 text-left transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-700 flex items-center justify-center text-amber-400">
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 text-[11px] leading-tight">{preset.name}</p>
                      <span className="text-[9px] text-amber-400 font-semibold">1-Click Apply</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Option 3: Custom Web URL */}
          <form onSubmit={handleApplyCustomUrl} className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
            <label className="block text-slate-300 font-bold flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-amber-400" /> Option 3: Paste Custom Image Web URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://example.com/company-logo.png"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
              <button
                type="submit"
                disabled={savingLogo}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
              >
                Apply URL
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-black px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
