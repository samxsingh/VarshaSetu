import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, BookOpen, ExternalLink, Activity } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#0B1726] text-[#F7F3EA] border-t border-white/10 relative overflow-hidden font-sans">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Column 1: Left Brand Info (5 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#008F83] text-white flex items-center justify-center font-heading font-black text-sm border border-white/20 shadow-[2px_2px_0px_#99E1DC]">
                VS
              </div>
              <div>
                <span className="font-heading font-black text-xl text-white tracking-tight block">
                  VarshaSetu <span className="font-hindi font-medium text-base text-[#99E1DC]">(वर्षासेतु)</span>
                </span>
                <span className="font-mono text-[10px] tracking-widest text-[#008F83] uppercase font-bold block">
                  MONSOON INTELLIGENCE
                </span>
              </div>
            </div>

            <p className="text-sm text-[#94A3B8] leading-relaxed max-w-sm">
              Climate intelligence for more informed agricultural decisions. Bridging planetary climate dynamics with village-level agronomic actions.
            </p>

            <div className="pt-2 text-xs font-mono text-[#62768A]">
              Lucknow Demonstration Edition • Central Plain Agro-Climatic Zone
            </div>
          </div>

          {/* Column 2: Platform Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider text-white border-b border-white/10 pb-2">
              PLATFORM
            </h4>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              <li>
                <Link to="/farmer/dashboard" className="hover:text-white transition-colors duration-150 flex items-center gap-1.5">
                  <span>Farmer Portal</span>
                </Link>
              </li>
              <li>
                <Link to="/officer" className="hover:text-white transition-colors duration-150 flex items-center gap-1.5">
                  <span>Officer Center</span>
                </Link>
              </li>
              <li>
                <Link to="/government/command-center" className="hover:text-white transition-colors duration-150 flex items-center gap-1.5">
                  <span>Government</span>
                </Link>
              </li>
              <li>
                <Link to="/analyst" className="hover:text-white transition-colors duration-150 flex items-center gap-1.5">
                  <span>Analyst Lab</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Science Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider text-white border-b border-white/10 pb-2">
              SCIENCE
            </h4>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              <li>
                <a href="#scientific-grounding" className="hover:text-white transition-colors duration-150 flex items-center gap-1.5">
                  <span>Scientific Grounding</span>
                </a>
              </li>
              <li>
                <Link to="/analyst/forecast-lab" className="hover:text-white transition-colors duration-150 flex items-center gap-1.5">
                  <span>Forecast Lab</span>
                </Link>
              </li>
              <li>
                <Link to="/farmer/what-if" className="hover:text-white transition-colors duration-150 flex items-center gap-1.5">
                  <span>Scenario Analysis</span>
                </Link>
              </li>
              <li>
                <a href="#provenance-strip" className="hover:text-white transition-colors duration-150 flex items-center gap-1.5">
                  <span>Provenance</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: System Mode & Anchor Info (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider text-white border-b border-white/10 pb-2">
              CURRENT SYSTEM MODE
            </h4>

            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E5A33D]/15 border border-[#E5A33D]/40 text-[#E5A33D] text-xs font-mono font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5A33D] animate-pulse" />
                  DIAGNOSTIC ONLY
                </span>
                <span className="text-[10px] font-mono text-[#94A3B8]">OFFLINE ARCHIVE</span>
              </div>

              <div className="space-y-1 text-xs text-[#94A3B8]">
                <div className="flex justify-between">
                  <span>Ground anchor:</span>
                  <strong className="font-mono text-white">UP_LKO_BKT</strong>
                </div>
                <div className="flex justify-between">
                  <span>Observations:</span>
                  <span className="text-white">Kharif 2024 · 122 records</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-start gap-2 text-[11px] text-[#E5A33D]/90 leading-tight">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Scientific demonstration mode. Not operational meteorology or commercial advisory.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Footer Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#62768A]">
          <div className="flex items-center gap-2">
            <span>© 2026 VarshaSetu.</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-[#94A3B8]">Open Science & Verified Agronomy</span>
          </div>

          <div className="text-center font-heading font-semibold text-[#94A3B8]">
            Right Information · Right Time · Right Place.
          </div>

          <div className="flex items-center gap-4 text-[#94A3B8]">
            <Link to="/about" className="hover:text-white transition-colors flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>About</span>
            </Link>
            <Link to="/how-it-works" className="hover:text-white transition-colors flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Methodology</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
