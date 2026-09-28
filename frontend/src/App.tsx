import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { FarmerLayout } from './layouts/FarmerLayout';
import { OfficerLayout } from './layouts/OfficerLayout';
import { AnalystLayout } from './layouts/AnalystLayout';
import { LoadingState } from './components/ui/LoadingState';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuthStore } from './stores/useAuthStore';

// Lazy Loaded Public Pages
const LandingPage = lazy(() => import('./pages/public/LandingPage').then((m) => ({ default: m.LandingPage })));
const AboutPage = lazy(() => import('./pages/public/AboutPage').then((m) => ({ default: m.AboutPage })));
const HowItWorksPage = lazy(() => import('./pages/public/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage })));
const LoginPage = lazy(() => import('./pages/public/LoginPage').then((m) => ({ default: m.LoginPage })));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Lazy Loaded Farmer Pages
const FarmerDashboardPage = lazy(() => import('./pages/farmer/FarmerDashboardPage').then((m) => ({ default: m.FarmerDashboardPage })));
const FarmerOnboardingPage = lazy(() => import('./pages/farmer/FarmerOnboardingPage').then((m) => ({ default: m.FarmerOnboardingPage })));
const FarmerForecastPage = lazy(() => import('./pages/farmer/FarmerForecastPage').then((m) => ({ default: m.FarmerForecastPage })));
const FarmerAdvisoryPage = lazy(() => import('./pages/farmer/FarmerAdvisoryPage').then((m) => ({ default: m.FarmerAdvisoryPage })));
const FarmerWhatIfPage = lazy(() => import('./pages/farmer/FarmerWhatIfPage').then((m) => ({ default: m.FarmerWhatIfPage })));
const FarmerProfilePage = lazy(() => import('./pages/farmer/FarmerProfilePage').then((m) => ({ default: m.FarmerProfilePage })));

// Lazy Loaded Officer Pages
const OfficerDashboardPage = lazy(() => import('./pages/officer/OfficerDashboardPage').then((m) => ({ default: m.OfficerDashboardPage })));
const OfficerMapPage = lazy(() => import('./pages/officer/OfficerMapPage').then((m) => ({ default: m.OfficerMapPage })));
const OfficerForecastPage = lazy(() => import('./pages/officer/OfficerForecastPage').then((m) => ({ default: m.OfficerForecastPage })));
const OfficerAdvisoriesPage = lazy(() => import('./pages/officer/OfficerAdvisoriesPage').then((m) => ({ default: m.OfficerAdvisoriesPage })));
const OfficerCropsPage = lazy(() => import('./pages/officer/OfficerCropsPage').then((m) => ({ default: m.OfficerCropsPage })));

// Lazy Loaded Government Pages
const GovernmentDashboardPage = lazy(() => import('./pages/government/GovernmentDashboardPage').then((m) => ({ default: m.GovernmentDashboardPage })));

// Lazy Loaded Analyst Pages
const AnalystOverviewPage = lazy(() => import('./pages/analyst/AnalystOverviewPage').then((m) => ({ default: m.AnalystOverviewPage })));
const ForecastLabPage = lazy(() => import('./pages/analyst/ForecastLabPage').then((m) => ({ default: m.ForecastLabPage })));
const ModelsPage = lazy(() => import('./pages/analyst/ModelsPage').then((m) => ({ default: m.ModelsPage })));
const DataHealthPage = lazy(() => import('./pages/analyst/DataHealthPage').then((m) => ({ default: m.DataHealthPage })));
const AlertCenterPage = lazy(() => import('./pages/analyst/AlertCenterPage').then((m) => ({ default: m.AlertCenterPage })));

// Lazy Loaded Admin Page
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));

import { OperationalDataProvider } from './context/OperationalDataContext';

export function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <OperationalDataProvider>
        <Suspense fallback={<LoadingState label="Loading VarshaSetu portal..." className="min-h-[50vh]" />}>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              {/* Public Routes */}
              <Route index element={<LandingPage />} />
              <Route path="about" element={<AboutPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="auth" element={<LoginPage />} />

            {/* Farmer Portal Routes - RBAC Protected */}
            <Route
              path="farmer"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <FarmerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<FarmerDashboardPage />} />
              <Route path="onboarding" element={<FarmerOnboardingPage />} />
              <Route path="forecast" element={<FarmerForecastPage />} />
              <Route path="advisory" element={<FarmerAdvisoryPage />} />
              <Route path="advisories" element={<Navigate to="/farmer/advisory" replace />} />
              <Route path="what-if" element={<FarmerWhatIfPage />} />
              <Route path="profile" element={<FarmerProfilePage />} />
            </Route>

            {/* Officer Command Center Routes - RBAC Protected */}
            <Route
              path="officer"
              element={
                <ProtectedRoute allowedRoles={['OFFICER']}>
                  <OfficerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OfficerDashboardPage />} />
              <Route path="dashboard" element={<OfficerDashboardPage />} />
              <Route path="map" element={<OfficerMapPage />} />
              <Route path="forecast" element={<OfficerForecastPage />} />
              <Route path="advisories" element={<OfficerAdvisoriesPage />} />
              <Route path="crops" element={<OfficerCropsPage />} />
            </Route>

            {/* Government Portal Routes - RBAC Protected */}
            <Route
              path="government"
              element={
                <ProtectedRoute allowedRoles={['GOVERNMENT']}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<GovernmentDashboardPage />} />
              <Route path="command-center" element={<GovernmentDashboardPage />} />
            </Route>

            {/* Analyst Lab Routes - RBAC Protected */}
            <Route
              path="analyst"
              element={
                <ProtectedRoute allowedRoles={['ANALYST']}>
                  <AnalystLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AnalystOverviewPage />} />
              <Route path="forecast-lab" element={<ForecastLabPage />} />
              <Route path="lab" element={<Navigate to="/analyst/forecast-lab" replace />} />
              <Route path="forecast" element={<Navigate to="/analyst/forecast-lab" replace />} />
              <Route path="models" element={<ModelsPage />} />
              <Route path="data-health" element={<DataHealthPage />} />
              <Route path="alerts" element={<AlertCenterPage />} />
            </Route>

            {/* Direct Forecast Lab Alias */}
            <Route path="forecast-lab" element={<Navigate to="/analyst/forecast-lab" replace />} />

            {/* Admin Routes - RBAC Protected */}
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
      </OperationalDataProvider>
    </BrowserRouter>
  );
}

export default App;
