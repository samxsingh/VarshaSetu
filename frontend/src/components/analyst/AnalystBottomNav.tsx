import React from 'react';
import { NavLink } from 'react-router-dom';
import { LineChart, FlaskConical, BellRing, Cpu, Database } from 'lucide-react';
import { cn } from '../../utils/cn';

export const AnalystBottomNav: React.FC = () => {
  const links = [
    { to: '/analyst', end: true, label: 'Signals', icon: <LineChart className="w-4 h-4" /> },
    { to: '/analyst/forecast-lab', label: 'Lab', icon: <FlaskConical className="w-4 h-4" /> },
    { to: '/analyst/models', label: 'Models', icon: <Cpu className="w-4 h-4" /> },
    { to: '/analyst/alerts', label: 'Alerts', icon: <BellRing className="w-4 h-4" /> },
    { to: '/analyst/data-health', label: 'Data', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <nav
      aria-label="Climate Analyst mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F3F6F7]/95 backdrop-blur-md border-t-2 border-[#102A43] shadow-[0_-4px_12px_rgba(16, 42, 67,0.08)] px-2 py-1.5"
    >
      <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-lg text-[10px] font-heading font-bold transition-all min-h-[48px] min-w-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490] active:translate-x-0.5 active:translate-y-0.5',
                isActive
                  ? 'bg-[#0E7490] text-white border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43]'
                  : 'text-[#486581] hover:text-[#102A43] active:bg-[#102A43]/5'
              )
            }
          >
            {link.icon}
            <span className="mt-0.5 leading-none">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
