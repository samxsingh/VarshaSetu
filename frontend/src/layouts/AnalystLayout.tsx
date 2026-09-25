import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LineChart, FlaskConical, Cpu, Database, BellRing } from 'lucide-react';
import { cn } from '../utils/cn';

export const AnalystLayout: React.FC = () => {
  const links = [
    { to: '/analyst', end: true, label: 'Climate Teleconnections', icon: <LineChart className="w-4 h-4" /> },
    { to: '/analyst/forecast-lab', label: 'Forecast & Hindcast Lab', icon: <FlaskConical className="w-4 h-4" /> },
    { to: '/analyst/alerts', label: 'Alert Center & Lifecycle', icon: <BellRing className="w-4 h-4" /> },
    { to: '/analyst/models', label: 'Model Registry', icon: <Cpu className="w-4 h-4" /> },
    { to: '/analyst/data-health', label: 'Data Source Health', icon: <Database className="w-4 h-4" /> },
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
                      ? 'bg-brand-teal text-white shadow-xs'
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
    </div>
  );
};
