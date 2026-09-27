import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Sprout,
  Landmark,
  FlaskConical,
  LogIn,
  UserPlus,
  AlertCircle,
  KeyRound,
  Phone,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { UserRole } from '@shared/types';
import { cn } from '../../utils/cn';
import { LoadingState } from '../../components/ui/LoadingState';
import { DEV_DEMO_PERSONAS, IS_DEMO_ENABLED, DemoPersona } from '../../config/demoPersonas';

export function getPersonaIcon(role: UserRole): React.ReactNode {
  switch (role) {
    case 'FARMER':
      return <Sprout className="w-5 h-5 text-emerald-700" />;
    case 'OFFICER':
      return <ShieldCheck className="w-5 h-5 text-blue-700" />;
    case 'GOVERNMENT':
      return <Landmark className="w-5 h-5 text-cyan-700" />;
    case 'ANALYST':
      return <FlaskConical className="w-5 h-5 text-purple-700" />;
    case 'ADMIN':
      return <Shield className="w-5 h-5 text-rose-700" />;
    default:
      return <KeyRound className="w-5 h-5 text-slate-700" />;
  }
}

export interface RoleChoice {
  role: UserRole;
  label: string; // Exact user-facing name: Farmer, Officer, Government, Analyst
  hindiLabel: string;
  description: string;
  designation: string;
  defaultPath: string;
  icon: React.ReactNode;
  tagColor: string;
}

export const ROLE_CHOICES: RoleChoice[] = [
  {
    role: 'FARMER',
    label: 'Farmer',
    hindiLabel: 'किसान',
    description: 'Access weather intelligence, forecasts, advisories, and farm decision support.',
    designation: 'Panchayat Bhaisamau, Bakshi Ka Talab',
    defaultPath: '/farmer/dashboard',
    icon: <Sprout className="w-5 h-5 text-emerald-700" />,
    tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  {
    role: 'OFFICER',
    label: 'Officer',
    hindiLabel: 'कृषि अधिकारी',
    description: 'Monitor field conditions, operational signals, and inspection workflows.',
    designation: 'District Agricultural Officer, Lucknow',
    defaultPath: '/officer/dashboard',
    icon: <ShieldCheck className="w-5 h-5 text-blue-700" />,
    tagColor: 'bg-blue-50 text-blue-800 border-blue-300',
  },
  {
    role: 'GOVERNMENT',
    label: 'Government',
    hindiLabel: 'राज्य योजना',
    description: 'Monitor district/state-level agricultural and climate intelligence.',
    designation: 'Joint Director Met, Uttar Pradesh',
    defaultPath: '/government/dashboard',
    icon: <Landmark className="w-5 h-5 text-cyan-700" />,
    tagColor: 'bg-cyan-50 text-cyan-800 border-cyan-300',
  },
  {
    role: 'ANALYST',
    label: 'Analyst',
    hindiLabel: 'विश्लेषक लैब',
    description: 'Analyze climate data, model behavior, data health, and scientific signals.',
    designation: 'Climate Data Scientist, Met Operations',
    defaultPath: '/analyst',
    icon: <FlaskConical className="w-5 h-5 text-purple-700" />,
    tagColor: 'bg-purple-50 text-purple-800 border-purple-300',
  },
];

/**
 * Server-authoritative safe destination resolver.
 * Ensures a user cannot be redirected to a workspace not permitted by their verified server role.
 */
export function getSafeRedirectPath(role: UserRole, attemptedPath?: string | null): string {
  const defaultPathByRole: Record<UserRole, string> = {
    FARMER: '/farmer/dashboard',
    OFFICER: '/officer/dashboard',
    GOVERNMENT: '/government/dashboard',
    ADMIN: '/admin',
    ANALYST: '/analyst',
  };

  if (!attemptedPath || attemptedPath === '/' || attemptedPath === '/auth' || attemptedPath === '/login') {
    return defaultPathByRole[role] || '/';
  }

  // Admin has universal operational clearance
  if (role === 'ADMIN') {
    return attemptedPath;
  }

  // Prevent role traversal / unauthorized redirection
  if (role === 'FARMER' && (attemptedPath.startsWith('/farmer') || attemptedPath.startsWith('/about') || attemptedPath.startsWith('/how-it-works'))) {
    return attemptedPath;
  }

  if (role === 'OFFICER' && (attemptedPath.startsWith('/officer') || attemptedPath.startsWith('/about') || attemptedPath.startsWith('/how-it-works'))) {
    return attemptedPath;
  }

  if (role === 'GOVERNMENT' && (attemptedPath.startsWith('/government') || attemptedPath.startsWith('/about') || attemptedPath.startsWith('/how-it-works'))) {
    return attemptedPath;
  }

  if (role === 'ANALYST' && (attemptedPath.startsWith('/analyst') || attemptedPath.startsWith('/forecast-lab') || attemptedPath.startsWith('/about') || attemptedPath.startsWith('/how-it-works'))) {
    return attemptedPath;
  }

  // Fallback to role-authoritative landing
  return defaultPathByRole[role] || '/';
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authStatus, login, register, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<UserRole>('FARMER');

  // Form state: Manual input fields start completely blank
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [useOtp, setUseOtp] = useState(false);
  const [otp, setOtp] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regIdentifier, setRegIdentifier] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // UI interaction states
  const [clientError, setClientError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePersonaRole, setActivePersonaRole] = useState<UserRole | null>(null);

  const operationalPersonas = DEV_DEMO_PERSONAS.filter((p) => p.role !== 'ADMIN');
  const adminPersona = DEV_DEMO_PERSONAS.find((p) => p.role === 'ADMIN');

  // Parse redirect target
  const searchParams = new URLSearchParams(location.search);
  const from = searchParams.get('from');

  // Redirect already authenticated users away from /auth or /login
  useEffect(() => {
    if (authStatus === 'AUTHENTICATED' && user) {
      const destination = getSafeRedirectPath(user.role, from);
      navigate(destination, { replace: true });
    }
  }, [authStatus, user, from, navigate]);

  const clearAllErrors = () => {
    clearError();
    setClientError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();

    // Client-side validation
    if (!identifier.trim()) {
      setClientError('Please enter your phone number or email address.');
      return;
    }

    if (!useOtp && !password) {
      setClientError('Please enter your password.');
      return;
    }

    if (useOtp && (!otp.trim() || otp.trim().length !== 6)) {
      setClientError('Please enter the 6-digit OTP code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {};
      if (identifier.includes('@')) {
        payload.email = identifier.trim();
      } else {
        payload.phoneNumber = identifier.trim();
      }

      if (useOtp) {
        payload.otp = otp.trim();
      } else {
        payload.password = password;
      }

      const authenticatedUser = await login(payload);
      const destination = getSafeRedirectPath(authenticatedUser.role, from);
      navigate(destination, { replace: true });
    } catch {
      // Backend error captured by auth store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();

    // Client-side validation
    if (!regFullName.trim() || regFullName.trim().length < 2) {
      setClientError('Full name must be at least 2 characters long.');
      return;
    }

    if (!regIdentifier.trim()) {
      setClientError('Please enter your phone number or email address.');
      return;
    }

    if (regIdentifier.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regIdentifier.trim())) {
      setClientError('Please enter a valid email address.');
      return;
    }

    if (!regPassword || regPassword.length < 8) {
      setClientError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        fullName: regFullName.trim(),
        password: regPassword,
        role: selectedRole,
      };

      if (regIdentifier.includes('@')) {
        payload.email = regIdentifier.trim();
      } else {
        payload.phoneNumber = regIdentifier.trim();
      }

      const registeredUser = await register(payload);
      const destination = getSafeRedirectPath(registeredUser.role, from);
      navigate(destination, { replace: true });
    } catch {
      // Backend error captured by auth store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (persona: DemoPersona) => {
    clearAllErrors();
    setActivePersonaRole(persona.role);
    setIsSubmitting(true);

    try {
      const payload: { phoneNumber?: string; email?: string; password: string } = {
        password: persona.password,
      };
      if (persona.phone.includes('@')) {
        payload.email = persona.phone;
      } else {
        payload.phoneNumber = persona.phone;
      }

      const authenticatedUser = await login(payload);
      const destination = getSafeRedirectPath(authenticatedUser.role, from);
      navigate(destination, { replace: true });
    } catch {
      // Error in store
    } finally {
      setIsSubmitting(false);
      setActivePersonaRole(null);
    }
  };

  // If session is actively being validated, display an institutional loading state
  if (authStatus === 'AUTH_INITIALIZING') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <LoadingState label="Verifying institutional security session..." />
        <p className="text-xs text-[#829AB1] font-mono mt-3">
          Checking VarshaSetu Authentication Gateway
        </p>
      </div>
    );
  }

  const activeErrorMessage = clientError || error;

  return (
    <div className="flex-1 bg-[#F8F9FA] bg-[radial-gradient(#102A43_0.75px,transparent_0.75px)] [background-size:24px_24px] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center" data-testid="auth-gateway">
      <div className="max-w-5xl mx-auto w-full">
        {/* Editorial Introduction / Heading Area */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white border border-[#102A43]/20 shadow-[1.5px_1.5px_0px_#102A43] text-[#0E7490] text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SECURE ACCESS GATEWAY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#102A43] tracking-tight">
            VarshaSetu Access Gateway
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#486581] max-w-lg mx-auto leading-relaxed">
            Select your operational role and securely enter the VarshaSetu climate intelligence workspace.
          </p>

          {/* Mode Switcher: LOGIN / REGISTER Segmented Control */}
          <div className="inline-flex items-center bg-[#EAF0F2] p-1 rounded-xl border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] mt-4" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'LOGIN'}
              onClick={() => {
                setMode('LOGIN');
                clearAllErrors();
              }}
              data-testid="tab-login"
              className={cn(
                'px-6 sm:px-8 py-2.5 rounded-lg text-xs font-heading font-bold transition-all flex items-center gap-2 cursor-pointer',
                mode === 'LOGIN'
                  ? 'bg-[#0E7490] text-white shadow-[2px_2px_0px_#102A43]'
                  : 'text-[#102A43] hover:text-[#0E7490] hover:bg-white/60'
              )}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>LOGIN</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'REGISTER'}
              onClick={() => {
                setMode('REGISTER');
                clearAllErrors();
              }}
              data-testid="tab-register"
              className={cn(
                'px-6 sm:px-8 py-2.5 rounded-lg text-xs font-heading font-bold transition-all flex items-center gap-2 cursor-pointer',
                mode === 'REGISTER'
                  ? 'bg-[#0E7490] text-white shadow-[2px_2px_0px_#102A43]'
                  : 'text-[#102A43] hover:text-[#0E7490] hover:bg-white/60'
              )}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>REGISTER</span>
            </button>
          </div>
        </div>

        {/* Error Alert Box */}
        {activeErrorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-500 flex items-start justify-between gap-3 text-red-950 shadow-[2px_2px_0px_#102A43]">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-bold">Authentication Notice:</span> {activeErrorMessage}
              </div>
            </div>
            <button
              type="button"
              onClick={clearAllErrors}
              className="text-red-600 hover:text-red-900 p-0.5 rounded cursor-pointer"
              title="Dismiss error"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* OPERATIONAL ROLE SELECTOR (4 Institutional Roles) */}
        <div className="mb-6" data-testid="role-selector">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0E7490]" />
              <span className="text-xs font-heading font-bold text-[#102A43] uppercase tracking-wider">
                Operational Roles
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#829AB1]">
              Select perspective for session
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ROLE_CHOICES.map((choice) => {
              const isSelected = selectedRole === choice.role;
              return (
                <button
                  key={choice.role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(choice.role);
                    clearAllErrors();
                  }}
                  data-testid={`role-choice-${choice.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={cn(
                    'p-3.5 rounded-xl border-2 text-left transition-all bg-white flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490]',
                    isSelected
                      ? 'border-[#0E7490] bg-[#E8F4F6]/50 shadow-[3px_3px_0px_#102A43] -translate-y-0.5 ring-2 ring-[#0E7490]/25'
                      : 'border-[#B8C5CC] hover:border-[#102A43] hover:shadow-[2px_2px_0px_#102A43]'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#F3F6F7] border border-[#B8C5CC] flex items-center justify-center">
                        {choice.icon}
                      </div>
                      {isSelected ? (
                        <div className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0E7490] text-white flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ACTIVE</span>
                        </div>
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-[#B8C5CC]" />
                      )}
                    </div>
                    <div>
                      <div className="font-heading font-black text-sm text-[#102A43]">
                        {choice.label}
                      </div>
                      <div className="text-[10px] text-[#0E7490] font-mono font-bold uppercase tracking-wider mb-1">
                        {choice.hindiLabel}
                      </div>
                      <p className="text-[11px] text-[#486581] font-sans leading-relaxed line-clamp-2">
                        {choice.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DUAL COLUMN: CREDENTIALS FORM & DEMO PRESETS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Active Mode Form (LOGIN or REGISTER) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-5 sm:p-6">
            {mode === 'LOGIN' ? (
              <>
                <div className="mb-4 pb-2.5 border-b border-[#B8C5CC]/60">
                  <h2 className="text-base sm:text-lg font-heading font-black text-[#102A43] flex items-center gap-2">
                    <LogIn className="w-4 h-4 text-[#0E7490]" />
                    Sign In Credentials
                  </h2>
                  <p className="text-xs text-[#486581] mt-0.5 font-sans">
                    Enter your verified credentials to establish an authenticated session.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} noValidate className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-[#102A43] uppercase tracking-wider mb-1">
                      Phone Number or Institutional Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#829AB1]">
                        {identifier.includes('@') ? (
                          <Mail className="w-4 h-4" />
                        ) : (
                          <Phone className="w-4 h-4" />
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Enter phone number or institutional email"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-[#B8C5CC] focus:border-[#0E7490] focus:ring-2 focus:ring-[#0E7490]/20 text-sm font-sans text-[#102A43] transition-all disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  {!useOtp ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-mono font-bold text-[#102A43] uppercase tracking-wider">
                          Password
                        </label>
                        {IS_DEMO_ENABLED && (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => setUseOtp(true)}
                            className="text-xs text-[#0E7490] hover:underline font-semibold cursor-pointer"
                          >
                            Use Demo OTP instead
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#829AB1]">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <input
                          type="password"
                          required
                          disabled={isSubmitting}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-[#B8C5CC] focus:border-[#0E7490] focus:ring-2 focus:ring-[#0E7490]/20 text-sm font-sans text-[#102A43] transition-all disabled:bg-slate-50"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-mono font-bold text-[#102A43] uppercase tracking-wider">
                          Demo OTP Code
                        </label>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => setUseOtp(false)}
                          className="text-xs text-[#0E7490] hover:underline font-semibold cursor-pointer"
                        >
                          Use Password instead
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting}
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        className="w-full px-3 py-2 rounded-xl border-2 border-[#B8C5CC] focus:border-[#0E7490] focus:ring-2 focus:ring-[#0E7490]/20 text-sm font-mono tracking-widest text-[#102A43] text-center disabled:bg-slate-50"
                      />
                      <p className="text-[11px] text-[#486581] mt-1 font-mono">
                        Development bypass OTP: <span className="font-bold text-[#102A43]">123456</span>
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3 px-4 min-h-[44px] rounded-xl bg-[#0E7490] hover:bg-[#155E75] text-white font-heading font-black text-sm shadow-[3px_3px_0px_#102A43] hover:shadow-[4px_4px_0px_#102A43] border-2 border-[#102A43] flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting && !activePersonaRole ? (
                      <span>Authenticating...</span>
                    ) : (
                      <>
                        <span>Sign In to VarshaSetu</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 pt-3 border-t border-[#B8C5CC]/60 text-center">
                  <p className="text-xs text-[#486581]">
                    Need a new account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('REGISTER');
                        clearAllErrors();
                      }}
                      className="font-bold text-[#0E7490] hover:underline cursor-pointer"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mb-5 pb-3 border-b border-[#B8C5CC]/60">
                  <h2 className="text-lg font-heading font-black text-[#102A43] flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-[#0E7490]" />
                    Create New Account
                  </h2>
                  <p className="text-xs text-[#486581] mt-1 font-sans">
                    Register for localized agricultural forecasting and advisory intelligence.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#102A43] uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#829AB1]">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting}
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="e.g. Rajesh Pratap Singh"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-[#B8C5CC] focus:border-[#0E7490] focus:ring-2 focus:ring-[#0E7490]/20 text-sm font-sans text-[#102A43] transition-all disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-[#102A43] uppercase tracking-wider mb-1.5">
                      Phone Number or Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#829AB1]">
                        {regIdentifier.includes('@') ? (
                          <Mail className="w-4 h-4" />
                        ) : (
                          <Phone className="w-4 h-4" />
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting}
                        value={regIdentifier}
                        onChange={(e) => setRegIdentifier(e.target.value)}
                        placeholder="Enter phone number or email address"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-[#B8C5CC] focus:border-[#0E7490] focus:ring-2 focus:ring-[#0E7490]/20 text-sm font-sans text-[#102A43] transition-all disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-[#102A43] uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#829AB1]">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        disabled={isSubmitting}
                        minLength={8}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-[#B8C5CC] focus:border-[#0E7490] focus:ring-2 focus:ring-[#0E7490]/20 text-sm font-sans text-[#102A43] transition-all disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#EAF0F2] border border-[#B8C5CC] text-xs text-[#486581]">
                    Registering as:{' '}
                    <strong className="text-[#102A43]">
                      {ROLE_CHOICES.find((c) => c.role === selectedRole)?.label}
                    </strong>
                  </div>

                  {selectedRole !== 'FARMER' && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <strong className="font-bold">Institutional Assignment Required:</strong> Direct self-registration is enabled for Farmer accounts. Institutional roles require administrative provisioning.{IS_DEMO_ENABLED ? ' For instant evaluation, use the 1-Click Demo Personas.' : ''}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#0E7490] hover:bg-[#155E75] text-white font-heading font-black text-sm shadow-[3px_3px_0px_#102A43] hover:shadow-[4px_4px_0px_#102A43] border-2 border-[#102A43] flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Registering...</span>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-[#B8C5CC]/60 text-center">
                  <p className="text-xs text-[#486581]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('LOGIN');
                        clearAllErrors();
                      }}
                      className="font-bold text-[#0E7490] hover:underline cursor-pointer"
                    >
                      Sign In here
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* RIGHT: In Development, show Quick Demonstration Personas; in Production, show Institutional Access Guidance */}
          <div className="lg:col-span-6 space-y-3" data-testid="auth-sidebar">
            {IS_DEMO_ENABLED ? (
              <div data-testid="demo-personas-section" className="bg-[#F8FAFC] rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-5 sm:p-6 space-y-3">
                <div className="pb-2.5 border-b border-[#B8C5CC]/60">
                  <div className="text-[10px] font-mono font-bold text-[#0E7490] uppercase tracking-wider mb-0.5">
                    LOCAL DEMO ACCESS
                  </div>
                  <h2 className="text-base sm:text-lg font-heading font-black text-[#102A43] uppercase tracking-wider">
                    Instant Role Access
                  </h2>
                  <p className="text-xs text-[#486581] mt-0.5 font-sans">
                    Choose an operational role to enter the demonstration workspace.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {operationalPersonas.map((persona) => {
                    const isLoadingThis = isSubmitting && activePersonaRole === persona.role;

                    return (
                      <button
                        key={persona.role}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleQuickLogin(persona)}
                        data-testid={`demo-persona-${persona.role.toLowerCase()}`}
                        className={cn(
                          'text-left p-2.5 sm:p-3 rounded-xl border-2 transition-all flex flex-col justify-between group bg-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490] min-h-[72px]',
                          'border-[#B8C5CC] hover:border-[#102A43] hover:shadow-[2px_2px_0px_#102A43] active:translate-x-0.5 active:translate-y-0.5',
                          isLoadingThis && 'border-[#0E7490] ring-2 ring-[#0E7490] bg-[#E8F4F6]/40'
                        )}
                      >
                        <div className="flex items-start justify-between gap-1.5 mb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-6 h-6 rounded bg-[#F3F6F7] border border-[#B8C5CC] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              {getPersonaIcon(persona.role)}
                            </div>
                            <span
                              className={cn(
                                'text-[10px] font-heading font-bold px-1.5 py-0.5 rounded border shrink-0',
                                persona.tagColor
                              )}
                            >
                              {persona.label}
                            </span>
                          </div>
                          <div className="shrink-0 text-[#829AB1] group-hover:text-[#0E7490] transition-colors">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-heading font-bold text-[#102A43] group-hover:text-[#0E7490] transition-colors truncate">
                            {persona.name}
                          </div>
                          {isLoadingThis ? (
                            <div className="text-[10px] font-mono font-bold text-[#0E7490] animate-pulse mt-0.5">
                              Authenticating...
                            </div>
                          ) : (
                            <div className="text-[10px] font-mono text-[#829AB1] mt-0.5">
                              1-click access
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {adminPersona && (
                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleQuickLogin(adminPersona)}
                        data-testid="demo-persona-admin"
                        className={cn(
                          'w-full text-left p-2.5 sm:p-3 rounded-xl border-2 transition-all flex items-center justify-between group bg-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 min-h-[48px]',
                          'border-rose-300 bg-rose-50/30 hover:border-rose-700 hover:shadow-[2px_2px_0px_#9F1239] active:translate-x-0.5 active:translate-y-0.5',
                          isSubmitting && activePersonaRole === 'ADMIN' && 'border-rose-600 ring-2 ring-rose-500 bg-rose-50/60'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-rose-100/80 border border-rose-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            {getPersonaIcon('ADMIN')}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-heading font-bold text-[#102A43] group-hover:text-rose-900 transition-colors truncate">
                                {adminPersona.name}
                              </span>
                              <span className="text-[10px] font-heading font-bold px-1.5 py-0.5 rounded border bg-rose-100 text-rose-800 border-rose-300 shrink-0">
                                {adminPersona.label}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-rose-700">
                              Full platform access • Cross-workspace governance
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 pl-2">
                          {isSubmitting && activePersonaRole === 'ADMIN' ? (
                            <span className="text-xs font-mono font-bold text-rose-700 animate-pulse">
                              Authenticating...
                            </span>
                          ) : (
                            <div className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-rose-700 group-hover:text-rose-900 transition-colors">
                              <span>ENTER</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#486581] pt-2 px-1 border-t border-[#B8C5CC]/50">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-[#102A43]">SECURE ACCESS</span>
                    <span>•</span>
                    <span>SERVER-SIDE RBAC</span>
                  </div>
                  <span className="text-[#829AB1]">Kharif 2024 Archive</span>
                </div>
              </div>
            ) : (
              <div data-testid="institutional-guidance-section" className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#0E7490]">
                  <ShieldCheck className="w-5 h-5 text-[#0E7490]" />
                  <h2 className="text-sm font-heading font-bold text-[#102A43] uppercase tracking-wider">
                    Institutional Access Guidance
                  </h2>
                </div>

                <div className="text-xs text-[#486581] space-y-2.5 leading-relaxed">
                  <p>
                    <strong className="text-[#102A43]">Authorized Personnel:</strong> Access to agricultural forecasting, operational alerts, and decision intelligence is restricted to registered farming communities and authorized state meteorological officers.
                  </p>
                  <p>
                    <strong className="text-[#102A43]">Farmer Access:</strong> Self-registration provides immediate localized forecast intelligence, weather risk indicators, and crop advisories.
                  </p>
                  <p>
                    <strong className="text-[#102A43]">Institutional Credentials:</strong> District Agricultural Officers (DAO) and State Planning Directors receive institutional credentials provisioned by the VarshaSetu Platform Administrator.
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[#B8C5CC] text-[11px] text-[#829AB1] font-mono">
                  State Meteorological RBAC Gateway • Encrypted Session
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export const AuthGatewayPage = LoginPage;
