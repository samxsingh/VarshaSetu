import React from 'react';
import { NavLink } from 'react-router-dom';
import { CloudSun, FileSpreadsheet, Sparkles, UserCheck, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

export const FarmerBottomNav: React.FC = () => {
  const { t } = useTranslation();

  const tabs = [
    { to: '/farmer/dashboard', label: t('nav.dashboard') || 'Dashboard', icon: <CloudSun className="w-5 h-5" /> },
    { to: '/farmer/forecast', label: t('nav.forecast') || 'Forecast', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { to: '/farmer/advisory', label: t('nav.advisory') || 'Advisory', icon: <ShieldAlert className="w-5 h-5" /> },
    { to: '/farmer/what-if', label: t('nav.whatIf') || 'What-If', icon: <Sparkles className="w-5 h-5" /> },
    { to: '/farmer/profile', label: t('nav.profile') || 'Profile', icon: <UserCheck className="w-5 h-5" /> },
  ];

  return (
    <nav
      aria-label="Farmer mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F7F3EA] border-t-2 border-[#0B1726] px-2 py-1.5 shadow-[0px_-2px_10px_rgba(11,23,38,0.1)]"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-[10px] font-heading font-bold transition-all min-h-[48px] min-w-[56px]',
                isActive
                  ? 'text-[#008F83]'
                  : 'text-[#435466] hover:text-[#0B1726]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'p-1 rounded-lg transition-colors border',
                    isActive
                      ? 'bg-[#008F83] text-white border-[#0B1726] shadow-[1.5px_1.5px_0px_#0B1726]'
                      : 'bg-white text-[#435466] border-transparent'
                  )}
                >
                  {tab.icon}
                </div>
                <span className="truncate max-w-[62px] mt-0.5">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
