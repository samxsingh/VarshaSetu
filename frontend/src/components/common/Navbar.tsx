import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Compass,
  Sprout,
  ShieldCheck,
  LineChart,
  Landmark,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { useAppStore } from '../../stores/useAppStore';
import { cn } from '../../utils/cn';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { setRole } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: t('nav.home', { defaultValue: 'Home' }), icon: <Compass className="w-3.5 h-3.5" /> },
    { to: '/farmer/dashboard', label: t('nav.farmer', { defaultValue: 'Farmer Portal' }), role: 'FARMER', icon: <Sprout className="w-3.5 h-3.5" /> },
    { to: '/officer', label: t('nav.officer', { defaultValue: 'Officer Center' }), role: 'OFFICER', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { to: '/government/command-center', label: t('nav.government', { defaultValue: 'Government' }), role: 'GOVERNMENT', icon: <Landmark className="w-3.5 h-3.5" /> },
    { to: '/analyst', label: t('nav.analyst', { defaultValue: 'Analyst Lab' }), role: 'ANALYST', icon: <LineChart className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 lg:px-8 pt-2.5 pb-2 transition-all duration-200">
      {/* Precision Instrument Floating Capsule Container */}
      <div
        className={cn(
          'max-w-7xl mx-auto rounded-2xl transition-all duration-200 px-3.5 sm:px-5 py-2 flex items-center justify-between',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border border-[#B8C5CC] shadow-[0_8px_30px_rgba(16,42,67,0.08)]'
            : 'bg-white/95 backdrop-blur-md border border-[#B8C5CC] shadow-[0_4px_16px_rgba(16,42,67,0.06)]'
        )}
      >
        {/* LEFT: VarshaSetu Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#0E7490] flex items-center justify-center text-white shadow-[2px_2px_0px_#102A43] border border-[#102A43] group-hover:bg-[#155E75] transition-all duration-200">
            <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
              <path
                d="M32 12C32 12 18 28 18 38C18 45.732 24.268 52 32 52C39.732 52 46 45.732 46 38C46 28 32 12 32 12Z"
                fill="#FFFFFF"
              />
              <path
                d="M32 26C32 26 25 35 25 40C25 43.866 28.134 47 32 47C35.866 47 39 43.866 39 40C39 35 32 26 32 26Z"
                fill="#0E7490"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-base sm:text-lg text-[#102A43] tracking-tight leading-none">
                VarshaSetu
              </span>
              <span className="text-[11px] font-sans font-medium text-[#0E7490] px-1.5 py-0.2 rounded bg-[#E8F4F6] border border-[#0891B2]/30">
                वर्षासेतु
              </span>
            </div>
            <p className="text-[9px] text-[#486581] font-heading font-semibold tracking-wider uppercase mt-0.5">
              Monsoon Intelligence
            </p>
          </div>
        </Link>

        {/* CENTER: Desktop Capsule Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#EAF0F2] p-1 rounded-xl border border-[#B8C5CC]">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.to ||
              (link.to !== '/' && location.pathname.startsWith(link.to));

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (link.role) setRole(link.role as any);
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading transition-all duration-200 select-none min-h-[34px]',
                  isActive
                    ? 'bg-[#0E7490] text-white font-semibold shadow-[1.5px_1.5px_0px_#102A43]'
                    : 'text-[#102A43] hover:text-[#0E7490] hover:bg-white/80 font-medium'
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Language Switcher & Controls */}
        <div className="hidden sm:flex items-center gap-2.5">
          <LanguageToggle />
          <Link
            to="/admin"
            className="p-1.5 text-[#486581] hover:text-[#102A43] rounded-lg hover:bg-[#EAF0F2] border border-transparent hover:border-[#B8C5CC] transition-colors"
            title={t('nav.admin', { defaultValue: 'Admin Portal' })}
            aria-label={t('nav.admin', { defaultValue: 'Admin Portal' })}
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Header Controls */}
        <div className="flex sm:hidden items-center gap-1.5">
          <LanguageToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#102A43] hover:bg-[#EAF0F2] border border-[#B8C5CC] min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 max-w-7xl mx-auto rounded-xl border border-[#B8C5CC] bg-white p-3 space-y-1.5 shadow-[0_8px_24px_rgba(16,42,67,0.12)] animate-fade-in">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.to ||
              (link.to !== '/' && location.pathname.startsWith(link.to));

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (link.role) setRole(link.role as any);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-heading transition-colors',
                  isActive
                    ? 'bg-[#0E7490] text-white font-semibold shadow-[2px_2px_0px_#102A43]'
                    : 'text-[#102A43] hover:bg-[#EAF0F2]'
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#B8C5CC] flex items-center justify-between px-2">
            <span className="text-xs font-heading text-[#486581]">System Administration</span>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-md bg-[#EAF0F2] text-[#102A43] border border-[#B8C5CC]"
              aria-label="Admin settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
