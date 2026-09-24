import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Header = ({ onOpenMobile, onRecordPaymentClick }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/students?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 right-0 w-full z-20 flex justify-between items-center px-4 sm:px-6 h-16 bg-white border-b border-slate-200 shadow-xs">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
          title="Open Menu"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name, roll no, parent contact..."
            className="w-full h-9.5 pl-9 pr-4 rounded-lg bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition-all"
          />
        </form>
      </div>

      {/* Center-Right: Academic Session & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 ml-2">
        {/* Academic Session Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-blue-700">AY 2026–27</span>
          <span className="text-slate-400">•</span>
          <span className="font-medium text-slate-600">Term 2</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Add Student Button */}
          <button
            onClick={() => navigate('/students/new')}
            className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-base text-blue-700">person_add</span>
            <span>Add Student</span>
          </button>

          {/* Record Payment Button */}
          <button
            onClick={() => {
              if (onRecordPaymentClick) onRecordPaymentClick();
              else navigate('/fees/collect');
            }}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-base">payments</span>
            <span>Record Payment</span>
          </button>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 pl-1 sm:pl-2 border-l border-slate-200">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-8.5 h-8.5 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="w-8.5 h-8.5 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="School Settings"
          >
            <span className="material-symbols-outlined text-xl">help_outline</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
