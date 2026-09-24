import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isMobileOpen, onCloseMobile, onEnrollClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Students', path: '/students', icon: 'school' },
    { label: 'Parents', path: '/parents', icon: 'family_restroom' },
    { label: 'Classes', path: '/classes', icon: 'meeting_room' },
    { label: 'Attendance', path: '/attendance', icon: 'fact_check' },
    { label: 'Fees', path: '/fees', icon: 'account_balance_wallet' },
    { label: 'Payments', path: '/payments', icon: 'payments' },
    { label: 'Reports', path: '/reports', icon: 'bar_chart' },
    { label: 'Settings', path: '/settings', icon: 'settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 z-40 flex flex-col justify-between shrink-0 bg-white border-r border-slate-200 shadow-sm transition-transform duration-200 select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding & Navigation */}
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
          {/* Brand Crest & School Identity */}
          <div className="flex items-center gap-3 px-2 pb-4 pt-1 border-b border-slate-200 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-sm shrink-0">
              <span className="material-symbols-outlined text-2xl">school</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold text-slate-900 tracking-tight font-headline truncate">
                Oakridge Academy
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                SchoolERP Portal
              </span>
            </div>
          </div>

          {/* Quick CTA Button: Enroll Student */}
          <div className="mb-4 px-1">
            <button
              onClick={() => {
                if (onEnrollClick) onEnrollClick();
                else navigate('/students/new');
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full h-10 flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold text-sm transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-lg">person_add</span>
              <span>Enroll Student</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-700'
                      : 'text-slate-600 font-normal hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`material-symbols-outlined text-xl ${
                        isActive ? 'text-blue-700' : 'text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Profile & Logout Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-2">
          {/* Admin Info Pill */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
            <img
              src={
                user?.avatar ||
                'https://lh3.googleusercontent.com/aida-public/AB6AXuCULvDNLtUXBd5MTEBB45X07BqKVKVNPnBEmrUTJj-VJ0XqhyFXWHRZ1Ft9KupswS258O_4MezIE1xYqhMp_dwjaz2IirSxAtBeCLfz3BJYyKcLesA5jX6yOuYf6b14bauWkjYyIbCC4NTPhfL-vnGcDmxj7NZnojtBKM-zmwpHTNOvAhIAFKi-RSfNiDr-VPnYV2PTd67VB3mVqjHHEaba7R2n7TEt3u44fuasBk04Se1dqqVAgFbp'
              }
              alt="Admin Profile"
              className="w-9 h-9 rounded-full object-cover border border-slate-200"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-900 truncate leading-snug">
                {user?.name || 'Robert Hayes'}
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                {user?.role || 'Principal / Admin'}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-xs font-medium"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Logout</span>
            </div>
            <span className="text-[11px] text-slate-400">v1.0 (MERN)</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
