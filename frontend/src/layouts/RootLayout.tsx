import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const RootLayout: React.FC = () => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/auth' ||
    location.pathname === '/login' ||
    location.pathname.startsWith('/auth/') ||
    location.pathname.startsWith('/login/');

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-slate-900">
      {/* Main App Navigation Bar */}
      <Navbar />

      {/* Primary Route Body */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Institutional Footer (omitted on access gateway / auth / login pages) */}
      {!isAuthPage && <Footer />}
    </div>
  );
};
