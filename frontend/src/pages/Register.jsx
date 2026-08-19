import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Wrench,
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  Shield,
  Sparkles
} from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register(
        formData.name,
        formData.email,
        formData.phone,
        formData.password,
        formData.role
      );
      if (res && res.success) {
        navigate('/');
      } else {
        setError('Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-950 font-sans text-slate-100">
      {/* LEFT COLUMN: Industrial Brand Showcase */}
      <div className="hidden lg:flex lg:col-span-7 relative bg-slate-950 flex-col justify-between p-12 overflow-hidden border-r border-slate-800/80">
        
        {/* Background Image & Ambient Glows */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-10000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop')`
          }}
        ></div>

        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Top Brand Tag */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Wrench className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-100">TOOLRENT</span>
            <span className="text-xs font-bold text-amber-400 block tracking-wider uppercase">Sri Lanka Pro</span>
          </div>
        </div>

        {/* Hero Content Showcase */}
        <div className="relative z-10 max-w-xl space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Instant Corporate Registration
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-slate-100 leading-tight tracking-tight">
            Join Sri Lanka’s Premier <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">Equipment Rental Network.</span>
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed">
            Register as a Customer to hire high-performance tools or as an Equipment Owner to list your machinery and monetize your industrial assets.
          </p>

          {/* Key Value Badges */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 space-y-1">
              <Building2 className="w-5 h-5 text-amber-400 mb-1" />
              <p className="text-lg font-black text-slate-100">5,000+</p>
              <p className="text-[11px] text-slate-400 font-medium">Active Tools</p>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 space-y-1">
              <Clock className="w-5 h-5 text-emerald-400 mb-1" />
              <p className="text-lg font-black text-slate-100">Instant</p>
              <p className="text-[11px] text-slate-400 font-medium">Online Hire</p>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 space-y-1">
              <Shield className="w-5 h-5 text-blue-400 mb-1" />
              <p className="text-lg font-black text-slate-100">100%</p>
              <p className="text-[11px] text-slate-400 font-medium">Verified Accounts</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <p>© 2026 ToolRent Sri Lanka Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Registration Form */}
      <div className="lg:col-span-5 flex flex-col justify-center p-6 sm:p-12 relative z-10 bg-slate-950">
        
        {/* Mobile Header Logo */}
        <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
            <Wrench className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-lg text-slate-100">TOOLRENT PRO</span>
        </div>

        <div className="w-full max-w-md mx-auto space-y-5">
          
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-100 tracking-tight">Create New Account</h2>
            <p className="text-xs text-slate-400">Join the industrial tool rental marketplace today.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Customer / Renter', value: 'customer' },
                  { label: 'Equipment Owner', value: 'owner' }
                ].map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setFormData({ ...formData, role: r.value })}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                      formData.role === r.value
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alexander Wright"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@company.com"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+94 77 123 4567"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01]"
            >
              {loading ? 'CREATING ACCOUNT...' : 'REGISTER ACCOUNT'} <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-900 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="text-amber-400 hover:underline font-bold">
              Sign In Here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
