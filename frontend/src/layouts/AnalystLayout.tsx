import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LineChart, FlaskConical, Cpu, Database, BellRing, Compass, ShieldAlert, Radio } from 'lucide-react';
import { AnalystBottomNav } from '../components/analyst/AnalystBottomNav';
import { cn } from '../utils/cn';

export const AnalystLayout: React.FC = () => {
  const links = [
    { to: '/analyst', end: true, label: 'Climate Teleconnections', icon: <LineChart className="w-4 h-4" /> },
    { to: '/analyst/forecast-lab', label: 'Forecast & Hindcast Lab', icon: <FlaskConical className="w-4 h-4" /> },
    { to: '/analyst/models', label: 'Model Benchmarks & SHAP', icon: <Cpu className="w-4 h-4" /> },
    { to: '/analyst/alerts', label: 'Alert Center & Lifecycle', icon: <BellRing className="w-4 h-4" /> },
    { to: '/analyst/data-health', label: 'Data Pipeline Health', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 pb-24 md:pb-12 bg-[#F7F3EA] min-h-screen relative font-sans">
      {/* Subtle contour texture overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-subtle-contour" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 relative z-10 space-y-6">
        {/* Research Lab Header Strip */}
        <header className="bg-white border-2 border-[#0B1726] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#0B1726] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-[#0B1726] text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-[#008F83]" />
                CLIMATE ANALYST LAB
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#DCEFF0] text-[#006B65] text-[10px] font-mono font-bold border border-[#008F83]/30">
                SCIENTIFIC RESEARCH WORKSTATION
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0B1726] mt-1 tracking-tight">
              Agro-Meteorological Downscaling & Reliability Laboratory
            </h1>
            <p className="text-xs text-[#435466] mt-0.5">
              Empirical atmospheric analysis, probability calibration, tree ensemble benchmarks, and counterfactual scenario modeling
            </p>
          </div>

          {/* Persistent Scientific Metadata Cluster */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FEF6E9] border-2 border-[#E5A33D] text-[10px] font-mono font-bold text-[#9A6218]">
              <span className="w-2 h-2 rounded-full bg-[#E5A33D] animate-pulse" />
              <span>DIAGNOSTIC ONLY</span>
              <span className="text-[#0B1726]/30">•</span>
              <span>UP_LKO_BKT</span>
              <span className="text-[#0B1726]/30">•</span>
              <span>KHARIF 2024</span>
              <span className="text-[#0B1726]/30">•</span>
              <span>122 OBS</span>
            </div>
          </div>
        </header>

        {/* Desktop Tab Navigation */}
        <div className="hidden md:flex items-center gap-2 border-b-2 border-[#0B1726]/15 pb-3">
          <nav aria-label="Analyst desktop navigation" className="flex items-center gap-2 flex-wrap">
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

      {/* Mobile Sticky Bottom Navigation */}
      <AnalystBottomNav />
    </div>
  );
};
