import React, { useEffect } from 'react';
import { Navigate, useLocation, Link, Outlet } from 'react-router-dom';
import { ShieldAlert, LogIn, ArrowRight, RefreshCw } from 'lucide-react';
import { UserRole } from '@shared/types';
import { useAuthStore } from '../../stores/useAuthStore';
import { LoadingState } from '../ui/LoadingState';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const location = useLocation();
  const { user, authStatus, initAuth } = useAuthStore();

  useEffect(() => {
    if (authStatus === 'IDLE') {
      initAuth();
    }
  }, [authStatus, initAuth]);

  // Initializing auth session check
  if (authStatus === 'IDLE' || authStatus === 'AUTH_INITIALIZING') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <LoadingState label="Verifying VarshaSetu institutional clearance & security session..." />
        <p className="text-xs text-[#829AB1] font-mono mt-3">
          Authoritative MERN RBAC Gateway • Checking JWT Signature
        </p>
      </div>
    );
  }

  // Not authenticated -> redirect to login preserving attempted destination
  if (authStatus === 'UNAUTHENTICATED' || !user) {
    return (
      <Navigate
        to={`/login?from=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  // Role verification (ADMIN has universal clearance)
  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = allowedRoles.includes(user.role) || user.role === 'ADMIN';

    if (!isAuthorized) {
      const rolePortalPath =
        user.role === 'FARMER'
          ? '/farmer/dashboard'
          : user.role === 'OFFICER'
          ? '/officer'
          : user.role === 'GOVERNMENT'
          ? '/government/command-center'
          : user.role === 'ANALYST'
          ? '/analyst'
          : '/admin';

      return (
        <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-8 bg-[#F3F6F7]">
          <div className="max-w-lg w-full bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-6 sm:p-8">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border-2 border-amber-600 flex items-center justify-center text-amber-700 mb-5">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 mb-2">
              403 FORBIDDEN • RBAC ENFORCEMENT
            </div>

            <h1 className="text-xl sm:text-2xl font-heading font-black text-[#102A43] mb-2">
              Perspective Access Restricted
            </h1>

            <p className="text-sm text-[#486581] leading-relaxed mb-4">
              Your active authenticated profile <strong className="text-[#102A43] font-mono">[{user.role}]</strong> does not have clearance for this operational perspective.
            </p>

            <div className="bg-[#EAF0F2] rounded-xl p-3.5 border border-[#B8C5CC] mb-6 text-xs text-[#102A43] space-y-1 font-mono">
              <div><span className="text-[#486581]">Authenticated User:</span> {user.fullName}</div>
              <div><span className="text-[#486581]">Assigned Role:</span> {user.role}</div>
              <div><span className="text-[#486581]">Required Perspective:</span> {allowedRoles.join(' OR ')}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={rolePortalPath}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E7490] hover:bg-[#155E75] text-white font-heading font-bold text-sm shadow-[2px_2px_0px_#102A43] border border-[#102A43] transition-all"
              >
                <span>Go to My Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={`/login?from=${encodeURIComponent(location.pathname)}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#102A43] font-heading font-semibold text-sm border border-[#B8C5CC] transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Switch Persona</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
