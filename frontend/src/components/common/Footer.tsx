import React from 'react';
import { useTranslation } from 'react-i18next';
import { PhoneCall, ShieldAlert, FileText, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-surface-border text-slate-700 text-xs mt-auto">
      {/* Helpline Strip */}
      <div className="bg-brand-teal-tint/50 border-b border-brand-teal-border/40 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-brand-teal-dark font-medium">
            <PhoneCall className="w-4 h-4 text-brand-teal shrink-0" />
            <span>{t('farmer.kisanCallCenter')}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
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
              <div className="w-7 h-7 rounded-lg bg-brand-teal text-white flex items-center justify-center font-bold text-xs">
                VS
              </div>
              <span className="font-heading font-bold text-slate-900 text-base">
                VarshaSetu (वर्षासेतु)
              </span>
            </div>
            <p className="text-slate-600 max-w-md leading-relaxed text-sm">
              Hyperlocal monsoon intelligence and agricultural decision support bridging planetary climate signals (ENSO, IOD, MJO) with village-level agronomic actions.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700" />
              <span>
                Demonstration platform currently initialized for Lucknow District, UP (`DEFAULT_DEMO_LOCATION`). Not operational meteorology.
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-2">
            <h4 className="font-heading font-semibold text-slate-900 text-sm">Navigation</h4>
            <ul className="space-y-1.5 text-slate-600">
              <li><a href="/" className="hover:text-brand-teal transition-colors">Home</a></li>
              <li><a href="/farmer/dashboard" className="hover:text-brand-teal transition-colors">Farmer Dashboard</a></li>
              <li><a href="/officer" className="hover:text-brand-teal transition-colors">Officer Command Center</a></li>
              <li><a href="/analyst" className="hover:text-brand-teal transition-colors">Analyst Model Registry</a></li>
              <li><a href="/government/command-center" className="hover:text-brand-teal transition-colors">Government Portal</a></li>
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
