import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CloudSun, FileSpreadsheet, Sparkles, UserCheck, ShieldAlert } from 'lucide-react';
import { FarmerBottomNav } from '../components/farmer/FarmerBottomNav';
import { AudioBriefingBar } from '../components/common/AudioBriefingBar';
import { cn } from '../utils/cn';

export const FarmerLayout: React.FC = () => {
  const { t } = useTranslation();

  const farmerNav = [
    { to: '/farmer/dashboard', label: t('nav.dashboard') || 'Weather & Forecast', icon: <CloudSun className="w-4 h-4" /> },
    { to: '/farmer/forecast', label: t('nav.forecast') || 'Scientific Forecast', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { to: '/farmer/advisory', label: t('nav.advisory') || 'Advisories', icon: <ShieldAlert className="w-4 h-4" /> },
    { to: '/farmer/what-if', label: t('nav.whatIf') || 'What-If Simulator', icon: <Sparkles className="w-4 h-4" /> },
    { to: '/farmer/profile', label: t('nav.profile') || 'Farm Profile', icon: <UserCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 pb-24 md:pb-12 bg-[#F3F6F7] min-h-screen relative font-sans">
      {/* Subtle contour texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-subtle-contour" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 relative z-10">
        
        {/* Desktop Tab Navigation for Farmer Subpages */}
        <div className="hidden md:flex items-center justify-between border-b-2 border-[#102A43]/15 pb-4 mb-6">
          <nav aria-label="Farmer desktop navigation" className="flex items-center gap-2">
            {farmerNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all min-h-[44px] border-2',
                    isActive
                      ? 'bg-[#0E7490] text-white border-[#102A43] shadow-[3px_3px_0px_#102A43] -translate-y-0.5'
                      : 'bg-white text-[#486581] border-[#102A43]/20 hover:text-[#102A43] hover:border-[#102A43] hover:bg-[#EAF0F2]'
                  )
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Audio Briefing Bar with Neo-Brutalist Frame */}
          <div className="w-80 shrink-0">
            <div className="bg-white rounded-xl border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] overflow-hidden">
              <AudioBriefingBar className="py-2 px-3" />
            </div>
          </div>
        </div>

        {/* Mobile Persistent Audio Bar */}
        <div className="md:hidden mb-4 bg-white rounded-xl border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] p-1">
          <AudioBriefingBar />
        </div>

        {/* Primary Content View */}
        <main className="relative z-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <FarmerBottomNav />
    </div>
  );
};
