import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onEnrollClick={() => navigate('/students/new')}
      />

      {/* Main Workspace Area (Offset by 256px / 64 tailwind units for desktop sidebar) */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0 transition-all">
        {/* Top Header Bar */}
        <Header
          onOpenMobile={() => setMobileMenuOpen(true)}
          onRecordPaymentClick={() => navigate('/fees/collect')}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
