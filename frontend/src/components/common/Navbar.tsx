import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  Compass,
  Sprout,
  ShieldCheck,
  LineChart,
  Landmark,
  Settings,
} from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { useAppStore } from '../../stores/useAppStore';
import { cn } from '../../utils/cn';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { currentRole, setRole } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t('nav.home'), icon: <Compass className="w-4 h-4" /> },
    { to: '/farmer/dashboard', label: t('nav.farmer'), role: 'FARMER', icon: <Sprout className="w-4 h-4" /> },
    { to: '/officer', label: t('nav.officer'), role: 'OFFICER', icon: <ShieldCheck className="w-4 h-4" /> },
    { to: '/government/command-center', label: t('nav.government'), role: 'GOVERNMENT', icon: <Landmark className="w-4 h-4" /> },
    { to: '/analyst', label: t('nav.analyst'), role: 'ANALYST', icon: <LineChart className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-teal flex items-center justify-center text-white shadow-sm group-hover:bg-brand-teal-dark transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 64 64" fill="none">
                <path d="M32 12C32 12 18 28 18 38C18 45.732 24.268 52 32 52C39.732 52 46 45.732 46 38C46 28 32 12 32 12Z" fill="#FAF7F2"/>
                <path d="M32 26C32 26 25 35 25 40C25 43.866 28.134 47 32 47C35.866 47 39 43.866 39 40C39 35 32 26 32 26Z" fill="#0D9488"/>
              </svg>
            </div>
            <div>
              <span className="font-heading font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                VarshaSetu
                <span className="text-xs font-normal text-brand-teal-dark font-sans px-1.5 py-0.5 bg-brand-teal-tint rounded-md border border-brand-teal-border">
                  वर्षासेतु
                </span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase hidden sm:block">
                Monsoon Intelligence
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => {
                    if (link.role) setRole(link.role as any);
                  }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium font-heading transition-colors min-h-[40px]',
                    isActive
                      ? 'bg-brand-teal-tint text-brand-teal-dark font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  )}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Utilities: Language & Role badge */}
          <div className="hidden sm:flex items-center gap-3">
            <LanguageToggle />
            <Link
              to="/admin"
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title={t('nav.admin')}
              aria-label={t('nav.admin')}
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-surface-border bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-fadeIn">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (link.role) setRole(link.role as any);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-base font-heading font-medium min-h-[48px]',
                  isActive
                    ? 'bg-brand-teal-tint text-brand-teal-dark font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-surface-border flex justify-between items-center px-2">
            <span className="text-xs text-slate-500 font-medium">{t('nav.admin')} Portal</span>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-brand-teal font-semibold underline"
            >
              Access Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
