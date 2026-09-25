import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { FarmerLayout } from './layouts/FarmerLayout';
import { OfficerLayout } from './layouts/OfficerLayout';
import { AnalystLayout } from './layouts/AnalystLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { AboutPage } from './pages/public/AboutPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';

// Farmer Pages
import { FarmerDashboardPage } from './pages/farmer/FarmerDashboardPage';
import { FarmerOnboardingPage } from './pages/farmer/FarmerOnboardingPage';
import { FarmerForecastPage } from './pages/farmer/FarmerForecastPage';
import { FarmerAdvisoryPage } from './pages/farmer/FarmerAdvisoryPage';
import { FarmerWhatIfPage } from './pages/farmer/FarmerWhatIfPage';
import { FarmerProfilePage } from './pages/farmer/FarmerProfilePage';

// Officer Pages
import { OfficerDashboardPage } from './pages/officer/OfficerDashboardPage';
import { OfficerMapPage } from './pages/officer/OfficerMapPage';
import { OfficerForecastPage } from './pages/officer/OfficerForecastPage';
import { OfficerAdvisoriesPage } from './pages/officer/OfficerAdvisoriesPage';
import { OfficerCropsPage } from './pages/officer/OfficerCropsPage';

// Government Pages
import { GovernmentDashboardPage } from './pages/government/GovernmentDashboardPage';

// Analyst Pages
import { AnalystOverviewPage } from './pages/analyst/AnalystOverviewPage';
import { ForecastLabPage } from './pages/analyst/ForecastLabPage';
import { ModelsPage } from './pages/analyst/ModelsPage';
import { DataHealthPage } from './pages/analyst/DataHealthPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          {/* Public Routes */}
          <Route index element={<LandingPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />

          {/* Farmer Portal Routes */}
          <Route path="farmer" element={<FarmerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<FarmerDashboardPage />} />
            <Route path="onboarding" element={<FarmerOnboardingPage />} />
            <Route path="forecast" element={<FarmerForecastPage />} />
            <Route path="advisory" element={<FarmerAdvisoryPage />} />
            <Route path="what-if" element={<FarmerWhatIfPage />} />
            <Route path="profile" element={<FarmerProfilePage />} />
          </Route>

          {/* Officer Command Center Routes */}
          <Route path="officer" element={<OfficerLayout />}>
            <Route index element={<OfficerDashboardPage />} />
            <Route path="map" element={<OfficerMapPage />} />
            <Route path="forecast" element={<OfficerForecastPage />} />
            <Route path="advisories" element={<OfficerAdvisoriesPage />} />
            <Route path="crops" element={<OfficerCropsPage />} />
          </Route>

          {/* Government Portal Routes */}
          <Route path="government">
            <Route index element={<Navigate to="command-center" replace />} />
            <Route path="command-center" element={<GovernmentDashboardPage />} />
          </Route>

          {/* Analyst Lab Routes */}
          <Route path="analyst" element={<AnalystLayout />}>
            <Route index element={<AnalystOverviewPage />} />
            <Route path="forecast-lab" element={<ForecastLabPage />} />
            <Route path="models" element={<ModelsPage />} />
            <Route path="data-health" element={<DataHealthPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="admin" element={<AdminDashboardPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
