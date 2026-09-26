import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PhoneCall, ShieldAlert, FileText, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  if (location.pathname === '/') {
    return null;
  }

  return (
    <footer className="bg-white border-t-2 border-[#102A43]/15 text-[#486581] text-xs mt-auto font-sans">
      {/* Helpline Strip */}
      <div className="bg-[#E8F4F6]/50 border-b border-[#0E7490]/20 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-[#155E75] font-semibold">
            <PhoneCall className="w-4 h-4 text-[#0E7490] shrink-0" />
            <span>{t('farmer.kisanCallCenter')}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px]">
            <span>KVK Lucknow: 0522-2970420</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">ICAR-CISH Rehmankhera, Kakori</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0E7490] text-white flex items-center justify-center font-bold text-xs border border-[#155E75] shadow-[1.5px_1.5px_0px_#102A43]">
                VS
              </div>
              <span className="font-heading font-black text-[#102A43] text-base">
                VarshaSetu (वर्षासेतु)
              </span>
            </div>
            <p className="text-slate-600 max-w-md leading-relaxed text-sm">
              Hyperlocal monsoon intelligence and agricultural decision support bridging planetary climate signals (ENSO, IOD, MJO) with village-level agronomic actions.
            </p>
            <div className="flex items-start gap-2.5 text-[11px] text-[#B45309] bg-[#FEF3C7] p-3 rounded-xl border border-[#D97706]/50">
              <ShieldAlert className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-heading font-bold text-[#102A43] block">Scientific Disclosure:</span>
                <span>Demonstration platform anchored to Bakshi Ka Talab (UP_LKO_BKT, Kharif 2024 archive · 122 observations). Operational mode: DIAGNOSTIC_ONLY.</span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-2">
            <h4 className="font-heading font-bold text-[#102A43] text-sm">Navigation</h4>
            <ul className="space-y-1.5 text-slate-600 font-medium">
              <li><Link to="/" className="hover:text-[#0E7490] transition-colors">Home</Link></li>
              <li><Link to="/farmer/dashboard" className="hover:text-[#0E7490] transition-colors">Farmer Dashboard</Link></li>
              <li><Link to="/officer" className="hover:text-[#0E7490] transition-colors">Officer Command Center</Link></li>
              <li><Link to="/government/command-center" className="hover:text-[#0E7490] transition-colors">Government Portal</Link></li>
              <li><Link to="/analyst" className="hover:text-[#0E7490] transition-colors">Analyst Research Lab</Link></li>
            </ul>
          </div>

          {/* Scientific Transparency & Docs */}
          <div className="space-y-2">
            <h4 className="font-heading font-semibold text-slate-900 text-sm">Scientific Basis</h4>
            <ul className="space-y-1.5 text-slate-600">
              <li className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>30-Year Climatology Baseline</span>
              </li>
              <li className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Probabilistic Brier Skill Scoring</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>IMD & NCMRWF Protocols</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© 2026 VarshaSetu. Built for climate-resilient Indian agriculture.</p>
          <p className="flex items-center gap-1">
            <span>Powered by open science & verified agronomy</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
