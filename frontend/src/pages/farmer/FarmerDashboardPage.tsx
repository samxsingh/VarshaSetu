import React from 'react';
import { FarmerPageHeader } from '../../components/farmer/FarmerPageHeader';
import { ScientificDisclosure } from '../../components/farmer/ScientificDisclosure';
import { FarmerHeader } from '../../components/farmer/FarmerHeader';
import { MonsoonGlanceCard } from '../../components/farmer/MonsoonGlanceCard';
import { CropAdvisoryCard } from '../../components/farmer/CropAdvisoryCard';
import { WhatIfPreviewCard } from '../../components/farmer/WhatIfPreviewCard';
import { OperationalSignalCenter } from '../../components/operations/OperationalSignalCenter';
import { FarmerLiveWeatherSection } from '../../components/farmer/FarmerLiveWeatherSection';

export const FarmerDashboardPage: React.FC = () => {
  return (
    <div className="space-y-6" data-testid="farmer-dashboard-page">
      {/* 1. Editorial Page Header with Diagnostic Status */}
      <FarmerPageHeader
        eyebrow="FARMER INTELLIGENCE"
        title="Understand the weather around your farm."
        subtitle="Calibrated monsoon signals, downscaled rainfall horizons, and timely agronomic advisories."
        status="DIAGNOSTIC ONLY"
        badgeLabel="HYPERLOCAL GROUNDING"
      />

      {/* 2. Scientific Disclosure & Boundary */}
      <ScientificDisclosure
        title="Scientific Decision Support & Ground Telemetry"
        message="Observational surface parameters are retrieved from validated meteorological stations and gridded high-resolution ECMWF/IMD numerical models. Calibrated agronomic guidelines are generated per crop stage."
      />

      {/* 3. Farm Location & Active Crop Profile Bar */}
      <FarmerHeader />

      {/* 4. Live Ground Conditions & Next 7 Days Outlook */}
      <FarmerLiveWeatherSection />

      {/* 4b. Probabilistic Monsoon Outlook (7, 14, 21, 30 Days) */}
      <MonsoonGlanceCard />

      {/* 4b. Operational Weather & Advisory Signals */}
      <OperationalSignalCenter
        blockId="UP_LKO_BKT"
        persona="FARMER"
        title="Operational Weather & Advisory Signals"
        description="Active meteorological events, forecast shifts, and advisory notifications for your block."
        maxItems={10}
      />

      {/* 5. Primary Crop Advisory: "What this means for your crop" */}
      <CropAdvisoryCard />

      {/* 6. What-If Simulator Teaser */}
      <WhatIfPreviewCard />
    </div>
  );
};
