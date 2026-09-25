import React from 'react';
import { FarmerHeader } from '../../components/farmer/FarmerHeader';
import { MonsoonGlanceCard } from '../../components/farmer/MonsoonGlanceCard';
import { CropAdvisoryCard } from '../../components/farmer/CropAdvisoryCard';
import { WhatIfPreviewCard } from '../../components/farmer/WhatIfPreviewCard';

export const FarmerDashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Farm Location & Active Crop Profile Bar */}
      <FarmerHeader />

      {/* Probabilistic Monsoon Outlook (7, 14, 21, 30 Days) */}
      <MonsoonGlanceCard />

      {/* Primary Crop Advisory: "What this means for your crop" */}
      <CropAdvisoryCard />

      {/* What-If Simulator Teaser */}
      <WhatIfPreviewCard />
    </div>
  );
};
