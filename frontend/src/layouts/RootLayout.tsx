import React from 'react';
import { Outlet } from 'react-router-dom';
import { DemoBanner } from '../components/common/DemoBanner';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-slate-900">
      {/* Universal Mandatory Demo & Transparency Banner */}
      <DemoBanner />

      {/* Main App Navigation Bar */}
      <Navbar />

      {/* Primary Route Body */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
};
