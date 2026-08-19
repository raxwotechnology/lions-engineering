import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, Search, Shield, HelpCircle } from 'lucide-react';

export const Navbar = ({ toggleMobileSidebar }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const roleLabel = (user?.role || 'customer').toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-8 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Global Search Bar */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-1.5 w-64 focus-within:w-80 focus-within:border-amber-500/50 transition-all">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search active tools, rentals, serials..."
            className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none w-full placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Automatic Logged-in User Role Badge */}
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
          <Shield className="w-3.5 h-3.5" />
          <span>{roleLabel} ROLE</span>
        </div>

        {/* Theme Toggle (Sun / Moon) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Light / Dark Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Notifications Button with Red Badge 3 */}
        <button className="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900">
            3
          </span>
        </button>

        {/* User Profile Info with Yellow Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'V'}
          </div>
          <div className="hidden md:block text-left leading-tight">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">{user?.name || 'Vimaya Madawaththa'}</p>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-amber-400 capitalize">{user?.role || 'Customer'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
