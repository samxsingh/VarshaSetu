import React from 'react';
import { NavLink } from 'react-router-dom';
import { CloudSun, FileSpreadsheet, Sparkles, UserCheck, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

export const FarmerBottomNav: React.FC = () => {
  const { t } = useTranslation();

  const tabs = [
    { to: '/farmer/dashboard', label: t('nav.dashboard'), icon: <CloudSun className="w-5 h-5" /> },
    { to: '/farmer/forecast', label: t('nav.forecast'), icon: <FileSpreadsheet className="w-5 h-5" /> },
    { to: '/farmer/advisory', label: t('nav.advisory'), icon: <ShieldAlert className="w-5 h-5" /> },
    { to: '/farmer/what-if', label: t('nav.whatIf'), icon: <Sparkles className="w-5 h-5" /> },
    { to: '/farmer/profile', label: t('nav.profile'), icon: <UserCheck className="w-5 h-5" /> },
  ];

  return (
    <nav
      aria-label="Farmer mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-surface-border px-2 py-1 shadow-floating"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[11px] font-heading font-medium transition-all min-h-[48px] min-w-[56px]',
                isActive
                  ? 'text-brand-teal font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'p-1 rounded-lg transition-colors',
                    isActive ? 'bg-brand-teal-tint text-brand-teal' : 'text-slate-500'
                  )}
                >
                  {tab.icon}
                </div>
                <span className="truncate max-w-[64px]">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
