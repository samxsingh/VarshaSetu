import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sprout,
  LineChart,
  Landmark,
  Settings,
  LogIn,
  AlertCircle,
  KeyRound,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { UserRole } from '@shared/types';
import { cn } from '../../utils/cn';

interface DemoPersona {
  role: UserRole;
  name: string;
  designation: string;
  phone: string;
  passwordPlain: string;
  targetPath: string;
  icon: React.ReactNode;
  tagColor: string;
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    role: 'FARMER',
    name: 'Ramesh Kumar',
    designation: 'Panchayat Bhaisamau, Bakshi Ka Talab',
    phone: '+919876543210',
    passwordPlain: 'FarmerPassword123!',
    targetPath: '/farmer/dashboard',
    icon: <Sprout className="w-5 h-5 text-emerald-700" />,
    tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  {
    role: 'OFFICER',
    name: 'Dr. Arvind Sharma',
    designation: 'District Agricultural Officer, Lucknow',
    phone: '+919876543211',
    passwordPlain: 'OfficerPassword123!',
    targetPath: '/officer',
    icon: <ShieldCheck className="w-5 h-5 text-blue-700" />,
    tagColor: 'bg-blue-50 text-blue-800 border-blue-300',
  },
  {
    role: 'GOVERNMENT',
    name: 'Sunita Verma',
    designation: 'Joint Director Met, Uttar Pradesh',
    phone: '+919876543212',
    passwordPlain: 'GovPassword123!',
    targetPath: '/government/command-center',
    icon: <Landmark className="w-5 h-5 text-cyan-700" />,
    tagColor: 'bg-cyan-50 text-cyan-800 border-cyan-300',
  },
  {
    role: 'ANALYST',
    name: 'Vikram Patel',
    designation: 'Senior Climate Data Scientist',
    phone: '+919876543213',
    passwordPlain: 'AnalystPassword123!',
    targetPath: '/analyst',
    icon: <LineChart className="w-5 h-5 text-indigo-700" />,
    tagColor: 'bg-indigo-50 text-indigo-800 border-indigo-300',
  },
  {
    role: 'ADMIN',
    name: 'System Administrator',
    designation: 'VarshaSetu Infrastructure Operations',
    phone: '+919876543214',
    passwordPlain: 'AdminPassword123!',
    targetPath: '/admin',
    icon: <Settings className="w-5 h-5 text-amber-700" />,
    tagColor: 'bg-amber-50 text-amber-800 border-amber-300',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError } = useAuthStore();

  const [identifier, setIdentifier] = useState('+919876543210');
  const [password, setPassword] = useState('FarmerPassword123!');
  const [useOtp, setUseOtp] = useState(false);
  const [otp, setOtp] = useState('123456');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePersonaRole, setActivePersonaRole] = useState<UserRole | null>(null);

  // Parse redirect target
  const searchParams = new URLSearchParams(location.search);
  const from = searchParams.get('from');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
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

      const user = await login(payload);
      const destination = from || getDefaultPath(user.role);
      navigate(destination, { replace: true });
    } catch {
      // Error handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (persona: DemoPersona) => {
    clearError();
    setActivePersonaRole(persona.role);
    setIsSubmitting(true);
    setIdentifier(persona.phone);
    setPassword(persona.passwordPlain);
    setUseOtp(false);

    try {
      const user = await login({
        phoneNumber: persona.phone,
        password: persona.passwordPlain,
      });
      const destination = from || persona.targetPath;
      navigate(destination, { replace: true });
    } catch {
      // Error in store
    } finally {
      setIsSubmitting(false);
      setActivePersonaRole(null);
    }
  };

  const getDefaultPath = (role: UserRole) => {
    switch (role) {
      case 'FARMER':
        return '/farmer/dashboard';
      case 'OFFICER':
        return '/officer';
      case 'GOVERNMENT':
        return '/government/command-center';
      case 'ANALYST':
        return '/analyst';
      case 'ADMIN':
        return '/admin';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F3F6F7] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F4F6] border border-[#0891B2]/30 text-[#0E7490] text-xs font-mono font-bold uppercase tracking-wider mb-3">
            Institutional Gateway • Authoritative RBAC
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#102A43] tracking-tight">
            Sign In to VarshaSetu
          </h1>
          <p className="mt-1 text-sm text-[#486581]">
            One Scientific Layer → Four Operational Perspectives. Real Express + MongoDB Authentication.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-300 flex items-start gap-3 text-red-900 shadow-[2px_2px_0px_#102A43]">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-bold">Authentication Failed:</span> {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Direct Login Form */}
          <div className="lg:col-span-6 bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-6 sm:p-7">
            <h2 className="text-lg font-heading font-bold text-[#102A43] mb-4 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-[#0E7490]" />
              Account Credentials
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#102A43] uppercase tracking-wider mb-1.5">
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
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="+919876543210 or email@domain.gov.in"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#B8C5CC] focus:border-[#0E7490] focus:ring-2 focus:ring-[#0E7490]/20 text-sm font-sans text-[#102A43] transition-all"
                  />
                </div>
              </div>

              {!useOtp ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono font-bold text-[#102A43] uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setUseOtp(true)}
                      className="text-xs text-[#0E7490] hover:underline font-medium"
                    >
                      Use Demo OTP instead
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#829AB1]">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#B8C5CC] focus:border-[#0E7490] focus:ring-2 focus:ring-[#0E7490]/20 text-sm font-sans text-[#102A43] transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono font-bold text-[#102A43] uppercase tracking-wider">
                      Demo OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setUseOtp(false)}
                      className="text-xs text-[#0E7490] hover:underline font-medium"
                    >
                      Use Password instead
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#B8C5CC] focus:border-[#0E7490] focus:ring-2 focus:ring-[#0E7490]/20 text-sm font-mono tracking-widest text-[#102A43] text-center"
                  />
                  <p className="text-[11px] text-[#486581] mt-1 font-mono">
                    Development bypass OTP: <span className="font-bold">123456</span>
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0E7490] hover:bg-[#155E75] text-white font-heading font-bold text-sm shadow-[2px_2px_0px_#102A43] border border-[#102A43] flex items-center justify-center gap-2 transition-all disabled:opacity-60"
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

            <div className="mt-5 pt-4 border-t border-[#B8C5CC] text-center">
              <p className="text-xs text-[#486581]">
                Need a new registration?{' '}
                <span className="font-medium text-[#102A43]">
                  Use the quick persona presets on the right or explore public insights.
                </span>
              </p>
            </div>
          </div>

          {/* RIGHT: Quick Demo Personas */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-heading font-bold text-[#102A43] uppercase tracking-wider">
                Quick Demonstration Personas
              </h2>
              <span className="text-[11px] font-mono text-[#0E7490] bg-[#E8F4F6] px-2 py-0.5 rounded border border-[#0891B2]/30">
                1-Click Auth
              </span>
            </div>

            <div className="space-y-2.5">
              {DEMO_PERSONAS.map((persona) => {
                const isLoadingThis = isSubmitting && activePersonaRole === persona.role;

                return (
                  <button
                    key={persona.role}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleQuickLogin(persona)}
                    className={cn(
                      'w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center justify-between group bg-white',
                      'border-[#B8C5CC] hover:border-[#102A43] hover:shadow-[3px_3px_0px_#102A43]',
                      isLoadingThis && 'border-[#0E7490] ring-2 ring-[#0E7490]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F3F6F7] border border-[#B8C5CC] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {persona.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-heading font-bold text-[#102A43] group-hover:text-[#0E7490] transition-colors">
                            {persona.name}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border',
                              persona.tagColor
                            )}
                          >
                            {persona.role}
                          </span>
                        </div>
                        <p className="text-xs text-[#486581] font-sans mt-0.5">
                          {persona.designation}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isLoadingThis ? (
                        <span className="text-xs font-mono text-[#0E7490] animate-pulse">
                          Signing in...
                        </span>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-[#EAF0F2] text-[#486581] group-hover:bg-[#0E7490] group-hover:text-white flex items-center justify-center transition-colors">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-[#EAF0F2] rounded-xl p-3 border border-[#B8C5CC] text-[11px] text-[#486581] leading-relaxed">
              <span className="font-bold text-[#102A43]">Authoritative RBAC Note:</span> Selecting a persona authenticates directly with the Express API and issues a signed JWT + refresh token. Access to portals outside the granted scope will be intercepted by the RBAC guard.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
