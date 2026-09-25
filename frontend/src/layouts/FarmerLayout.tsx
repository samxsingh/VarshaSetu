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
    { to: '/farmer/dashboard', label: t('nav.dashboard'), icon: <CloudSun className="w-4 h-4" /> },
    { to: '/farmer/forecast', label: t('nav.forecast'), icon: <FileSpreadsheet className="w-4 h-4" /> },
    { to: '/farmer/advisory', label: t('nav.advisory'), icon: <ShieldAlert className="w-4 h-4" /> },
    { to: '/farmer/what-if', label: t('nav.whatIf'), icon: <Sparkles className="w-4 h-4" /> },
    { to: '/farmer/profile', label: t('nav.profile'), icon: <UserCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 pb-20 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Desktop Tab Navigation for Farmer Subpages */}
        <div className="hidden md:flex items-center justify-between border-b border-surface-border pb-3 mb-6">
          <div className="flex items-center gap-2">
            {farmerNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-medium transition-colors min-h-[40px]',
                    isActive
                      ? 'bg-brand-teal text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  )
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="w-80">
            <AudioBriefingBar className="py-2 px-3 rounded-xl" />
          </div>
        </div>

        {/* Mobile Persistent Audio Bar */}
        <div className="md:hidden mb-4">
          <AudioBriefingBar />
        </div>

        {/* Content View */}
        <Outlet />
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <FarmerBottomNav />
    </div>
  );
};
