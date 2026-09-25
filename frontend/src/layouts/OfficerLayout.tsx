import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Map, CloudRain, Bell, Sprout } from 'lucide-react';
import { BulletinModal } from '../components/officer/BulletinModal';
import { cn } from '../utils/cn';

export const OfficerLayout: React.FC = () => {
  const { t } = useTranslation();

  const links = [
    { to: '/officer', end: true, label: 'Command Center', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/officer/map', label: 'GIS Risk Map', icon: <Map className="w-4 h-4" /> },
    { to: '/officer/forecast', label: 'Block Forecasts', icon: <CloudRain className="w-4 h-4" /> },
    { to: '/officer/advisories', label: 'Advisory Bulletins', icon: <Bell className="w-4 h-4" /> },
    { to: '/officer/crops', label: 'Crop Vulnerability', icon: <Sprout className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 pb-12">
      <div className="bg-white border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-heading font-semibold transition-colors whitespace-nowrap min-h-[38px]',
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Outlet />
      </div>

      {/* Global Officer Bulletin Broadcast Modal */}
      <BulletinModal />
    </div>
  );
};
