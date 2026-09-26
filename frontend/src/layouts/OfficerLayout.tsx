import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Map, CloudRain, Bell, Sprout, Send, ShieldAlert, Radio } from 'lucide-react';
import { BulletinModal } from '../components/officer/BulletinModal';
import { OfficerBottomNav } from '../components/officer/OfficerBottomNav';
import { useOfficerStore } from '../stores/useOfficerStore';
import { cn } from '../utils/cn';

export const OfficerLayout: React.FC = () => {
  const { t } = useTranslation();
  const { setBulletinModalOpen, selectedDistrict } = useOfficerStore();

  const links = [
    { to: '/officer', end: true, label: 'Command Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/officer/map', label: 'GIS Risk Map', icon: <Map className="w-4 h-4" /> },
    { to: '/officer/forecast', label: 'Block Forecasts', icon: <CloudRain className="w-4 h-4" /> },
    { to: '/officer/advisories', label: 'Advisory Bulletins', icon: <Bell className="w-4 h-4" /> },
    { to: '/officer/crops', label: 'Crop Vulnerability', icon: <Sprout className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 pb-24 md:pb-12 bg-[#F7F3EA] min-h-screen relative font-sans">
      {/* Subtle contour texture overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-subtle-contour" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 relative z-10 space-y-6">

        {/* Global Officer Workstation Header Bar */}
        <div className="bg-white border-2 border-[#0B1726] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#0B1726] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-[#008F83] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                FIELD EXTENSION WORKSTATION
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#DCEFF0] text-[#006B65] text-[10px] font-mono font-bold border border-[#008F83]/30">
                {selectedDistrict} District (UP_LKO)
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0B1726] mt-1 tracking-tight">
              Agro-Meteorological Field Intelligence
            </h1>
            <p className="text-xs text-[#435466] mt-0.5">
              Block-level downscaled weather signals, empirical risk indicators & agronomic contingency command across 440 Gram Panchayats
            </p>
          </div>

          {/* Persistent Status Cluster & Quick Action */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF6E9] border-2 border-[#E5A33D] text-[10px] font-mono font-bold text-[#9A6218]">
              <span className="w-2 h-2 rounded-full bg-[#E5A33D] animate-pulse" />
              <span>DIAGNOSTIC ONLY</span>
              <span className="text-[#0B1726]/40">•</span>
              <span>UP_LKO_BKT</span>
              <span className="text-[#0B1726]/40">•</span>
              <span>122 OBS</span>
            </div>

            <button
              onClick={() => setBulletinModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold bg-[#008F83] text-white border-2 border-[#0B1726] shadow-[2px_2px_0px_#0B1726] hover:-translate-y-0.5 active:translate-y-0 transition-all min-h-[40px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Bulletin</span>
            </button>
          </div>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden md:flex items-center gap-2 border-b-2 border-[#0B1726]/15 pb-3">
          <nav aria-label="Officer desktop navigation" className="flex items-center gap-2 flex-wrap">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all min-h-[44px] border-2',
                    isActive
                      ? 'bg-[#008F83] text-white border-[#0B1726] shadow-[3px_3px_0px_#0B1726] -translate-y-0.5'
                      : 'bg-white text-[#435466] border-[#0B1726]/20 hover:text-[#0B1726] hover:border-[#0B1726] hover:bg-[#FDFBF7]'
                  )
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sub-Route Views */}
        <main className="relative z-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Sticky Navigation */}
      <OfficerBottomNav />

      {/* Global Officer Bulletin Broadcast Modal */}
      <BulletinModal />
    </div>
  );
};
