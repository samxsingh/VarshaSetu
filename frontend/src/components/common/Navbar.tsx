import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserRole } from '@shared/types';
import {
  Compass,
  Sprout,
  ShieldCheck,
  LineChart,
  Landmark,
  Settings,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { RealtimeStatusBadge } from './RealtimeStatusBadge';
import { NotificationDrawer } from './NotificationDrawer';
import { GlobalDataContextIndicator } from './GlobalDataContextIndicator';
import { useAppStore } from '../../stores/useAppStore';
import { PUBLIC_NAVIGATION } from '../../config/navigation';
import { useAuthStore } from '../../stores/useAuthStore';
import { cn } from '../../utils/cn';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { setRole } = useAppStore();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');

  const isHomePage = location.pathname === '/';
  const isAuthPage =
    location.pathname === '/auth' ||
    location.pathname === '/login' ||
    location.pathname.startsWith('/auth/') ||
    location.pathname.startsWith('/login/');
  const isPublicHeader = isHomePage || isAuthPage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active section tracking on homepage
  useEffect(() => {
    if (!isHomePage) return;

    const sectionIds = PUBLIC_NAVIGATION.map((item) => item.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((e) => e.isIntersecting);
          if (visible.length > 0) {
            const topMost = visible.reduce((prev, curr) =>
              curr.intersectionRatio > prev.intersectionRatio ? curr : prev
            );
            if (topMost.target.id) {
              setActiveSection(topMost.target.id);
            }
          }
        },
        {
          rootMargin: '-80px 0px -40% 0px',
          threshold: [0.1, 0.3, 0.6],
        }
      );

      elements.forEach((el) => observer!.observe(el));
    }

    const handleScrollTracking = () => {
      const scrollPos = window.scrollY + 140;
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(el.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScrollTracking, { passive: true });

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('scroll', handleScrollTracking);
    };
  }, [isHomePage]);

  // Brand Header for Public Landing/Home Page & Authentication Gateway
  if (isPublicHeader) {
    return (
      <header className="sticky top-0 z-40 px-3 sm:px-6 lg:px-8 pt-2.5 pb-2 transition-all duration-200">
        <div
          className={cn(
            'max-w-7xl mx-auto rounded-xl transition-all duration-200 px-3.5 sm:px-6 py-2.5 flex items-center justify-between',
            isScrolled
              ? 'bg-[#FAF7F2]/90 backdrop-blur-md border border-[#102A43]/15 shadow-sm'
              : 'bg-[#FAF7F2]/80 backdrop-blur-sm border border-[#102A43]/10 shadow-[0_2px_8px_rgba(16,42,67,0.03)]'
          )}
        >
          {/* VarshaSetu Public Brand Identity */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label="VarshaSetu Home">
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

          {/* Center Navigation on Homepage */}
          {isHomePage && (
            <nav aria-label="Homepage navigation" className="hidden md:flex items-center gap-5 lg:gap-7">
              {PUBLIC_NAVIGATION.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={cn(
                      'text-xs font-mono font-semibold uppercase tracking-wider py-1 border-b-2 transition-all duration-150',
                      isActive
                        ? 'text-[#0E7490] border-[#0E7490]'
                        : 'text-[#486581] border-transparent hover:text-[#0E7490] hover:border-[#0E7490]/30'
                    )}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          )}

          {/* Right Action: Institutional Sign In Control on Homepage */}
          {isHomePage && (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/auth"
                className="group inline-flex items-center gap-2 px-4 sm:px-4.5 py-2 rounded-full font-heading font-semibold text-xs text-[#FAF7F2] bg-[#102A43] hover:bg-[#0E7490] border border-[#102A43] hover:border-[#0E7490] shadow-[2px_2px_0px_rgba(14,116,144,0.25)] hover:shadow-[3px_3px_0px_rgba(16,42,67,0.35)] hover:-translate-y-0.5 transition-all duration-200 min-h-[44px] justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490]"
              >
                <User className="w-3.5 h-3.5 text-[#0E7490] group-hover:text-white transition-colors" />
                <span>Sign in</span>
                <span className="text-xs transition-transform duration-200 group-hover:translate-x-0.5 text-white/80 group-hover:text-white" aria-hidden="true">
                  →
                </span>
              </Link>

              {/* Mobile Menu Trigger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-[#102A43] hover:text-[#0E7490] hover:bg-[#E8F4F6] border border-[#102A43]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* Institutional Entry Clearance Indicator on Auth Gateway */}
          {isAuthPage && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF0F2] border border-[#B8C5CC] text-[11px] font-mono font-medium text-[#486581]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SECURE ACCESS GATEWAY</span>
            </div>
          )}
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        {isHomePage && mobileMenuOpen && (
          <div className="md:hidden max-w-7xl mx-auto mt-2 p-3 rounded-xl bg-[#FAF7F2] border border-[#102A43]/15 shadow-md animate-fade-up">
            <div className="flex flex-col space-y-1">
              {PUBLIC_NAVIGATION.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'px-3.5 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-colors min-h-[44px] flex items-center',
                      isActive
                        ? 'bg-[#E8F4F6] text-[#0E7490]'
                        : 'text-[#486581] hover:bg-black/5 hover:text-[#102A43]'
                    )}
                  >
                    {item.label}
                  </a>
                );
              })}
              <div className="pt-2 mt-1 border-t border-[#102A43]/10">
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-between px-3.5 py-2.5 rounded-lg font-heading font-semibold text-xs text-[#FAF7F2] bg-[#102A43] hover:bg-[#0E7490] min-h-[44px] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#0E7490]" />
                    <span>Sign in</span>
                  </div>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    );
  }

  // Authenticated / Inner Portal Navigation Configuration
  interface WorkspaceNavDef {
    role: UserRole;
    label: string;
    to: string;
    icon: React.ReactNode;
  }

  const workspaceMap: Record<UserRole, WorkspaceNavDef> = {
    FARMER: {
      role: 'FARMER',
      label: t('nav.farmer', { defaultValue: 'Farmer Portal' }),
      to: '/farmer/dashboard',
      icon: <Sprout className="w-3.5 h-3.5 text-white" />,
    },
    OFFICER: {
      role: 'OFFICER',
      label: t('nav.officer', { defaultValue: 'Officer Center' }),
      to: '/officer/dashboard',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-white" />,
    },
    GOVERNMENT: {
      role: 'GOVERNMENT',
      label: t('nav.government', { defaultValue: 'Government' }),
      to: '/government/command-center',
      icon: <Landmark className="w-3.5 h-3.5 text-white" />,
    },
    ANALYST: {
      role: 'ANALYST',
      label: t('nav.analyst', { defaultValue: 'Analyst Lab' }),
      to: '/analyst',
      icon: <LineChart className="w-3.5 h-3.5 text-white" />,
    },
    ADMIN: {
      role: 'ADMIN',
      label: 'Administrator',
      to: '/admin',
      icon: <Settings className="w-3.5 h-3.5 text-rose-700" />,
    },
  };

  const adminWorkspaceList: WorkspaceNavDef[] = [
    workspaceMap.ADMIN,
    workspaceMap.FARMER,
    workspaceMap.OFFICER,
    workspaceMap.GOVERNMENT,
    workspaceMap.ANALYST,
  ];

  const deriveRoleFromPath = (pathname: string): UserRole | null => {
    if (pathname.startsWith('/farmer')) return 'FARMER';
    if (pathname.startsWith('/officer')) return 'OFFICER';
    if (pathname.startsWith('/government')) return 'GOVERNMENT';
    if (pathname.startsWith('/analyst') || pathname.startsWith('/forecast-lab')) return 'ANALYST';
    if (pathname.startsWith('/admin')) return 'ADMIN';
    return null;
  };

  const effectiveRole = user?.role || deriveRoleFromPath(location.pathname) || 'FARMER';
  const currentWorkspace = workspaceMap[effectiveRole] || workspaceMap.FARMER;
  const isAdmin = (user?.role === 'ADMIN') || (!user && effectiveRole === 'ADMIN');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

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
        {/* LEFT: VarshaSetu Brand Logo (links to current authorized workspace) */}
        <Link
          to={user ? currentWorkspace.to : '/'}
          className="flex items-center gap-2.5 group shrink-0"
          aria-label="VarshaSetu Home"
        >
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

        {/* CENTER: Role-Locked Workspace Navigation (or Administration for ADMIN) */}
        <nav aria-label="Portal navigation" className="hidden lg:flex items-center">
          {isAdmin ? (
            <div className="flex items-center gap-1 bg-[#EAF0F2] p-1 rounded-xl border border-[#B8C5CC]">
              <span className="text-[10px] font-mono font-bold uppercase text-[#486581] px-2.5 py-0.5 tracking-wider">
                Workspace Access:
              </span>
              {adminWorkspaceList.map((link) => {
                const isActive =
                  link.role === 'ADMIN'
                    ? location.pathname.startsWith('/admin')
                    : link.role === 'FARMER'
                    ? location.pathname.startsWith('/farmer')
                    : link.role === 'OFFICER'
                    ? location.pathname.startsWith('/officer')
                    : link.role === 'GOVERNMENT'
                    ? location.pathname.startsWith('/government')
                    : location.pathname.startsWith('/analyst');

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-heading transition-all duration-200 select-none min-h-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490]',
                      isActive
                        ? 'bg-[#0E7490] text-white font-bold shadow-[1.5px_1.5px_0px_#102A43]'
                        : 'text-[#102A43] hover:text-[#0E7490] hover:bg-white/80 font-medium'
                    )}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Link
              to={currentWorkspace.to}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0E7490] text-white font-bold shadow-[1.5px_1.5px_0px_#102A43] border border-[#102A43] transition-all select-none"
              aria-label={currentWorkspace.label}
            >
              {currentWorkspace.icon}
              <span className="text-xs font-heading font-bold text-white">
                {currentWorkspace.label}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-white text-[#0E7490] leading-none">
                Active Session
              </span>
            </Link>
          )}
        </nav>

        {/* RIGHT: Language Switcher, Realtime Status, Alerts & Controls */}
        <div className="hidden sm:flex items-center gap-2">
          {user && <GlobalDataContextIndicator />}
          <RealtimeStatusBadge />
          <NotificationDrawer />
          <LanguageToggle />

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#B8C5CC]">
              <div className="flex flex-col text-right">
                <span className="text-xs font-heading font-bold text-[#102A43] truncate max-w-[130px]">
                  {user.fullName}
                </span>
                <span className="text-[10px] font-mono font-bold text-[#0E7490] uppercase leading-none">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-heading font-semibold text-[#486581] hover:text-red-700 hover:bg-red-50 border border-[#B8C5CC]/60 hover:border-red-200 transition-colors"
                title="Sign out of VarshaSetu"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E7490] hover:bg-[#155E75] text-white text-xs font-heading font-bold shadow-[1.5px_1.5px_0px_#102A43] border border-[#102A43] transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="p-2 text-[#486581] hover:text-[#102A43] rounded-lg hover:bg-[#EAF0F2] border border-transparent hover:border-[#B8C5CC] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490]"
              title={t('nav.admin', { defaultValue: 'Admin Portal' })}
              aria-label={t('nav.admin', { defaultValue: 'Admin Portal' })}
            >
              <Settings className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Mobile Header Controls */}
        <div className="flex sm:hidden items-center gap-1.5">
          <RealtimeStatusBadge compact />
          <NotificationDrawer />
          <LanguageToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#102A43] hover:bg-[#EAF0F2] border border-[#B8C5CC] min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 max-w-7xl mx-auto rounded-xl border border-[#B8C5CC] bg-white p-3 space-y-1.5 shadow-[0_8px_24px_rgba(16,42,67,0.12)] animate-fade-in">
          {/* User state in mobile */}
          {user ? (
            <div className="p-2.5 rounded-lg bg-[#EAF0F2] border border-[#B8C5CC] flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-heading font-bold text-[#102A43]">{user.fullName}</p>
                <p className="text-[10px] font-mono text-[#0E7490] font-bold">{user.role} PERSPECTIVE</p>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 rounded bg-white text-xs font-heading font-bold text-red-700 border border-red-200 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 p-2.5 mb-2 rounded-lg bg-[#0E7490] text-white font-heading font-bold text-xs shadow-[2px_2px_0px_#102A43] border border-[#102A43]"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to VarshaSetu</span>
            </Link>
          )}

          {isAdmin ? (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono font-bold text-[#486581] uppercase tracking-wider">
                Workspace Access
              </div>
              {adminWorkspaceList.map((link) => {
                const isActive = location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
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
            </div>
          ) : (
            <Link
              to={currentWorkspace.to}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-heading bg-[#0E7490] text-white font-semibold shadow-[2px_2px_0px_#102A43]"
            >
              {currentWorkspace.icon}
              <span>{currentWorkspace.label}</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
