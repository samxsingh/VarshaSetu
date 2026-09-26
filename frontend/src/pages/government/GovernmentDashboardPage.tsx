import React, { useState, useEffect } from 'react';
import { GovCommandHeader } from '../../components/government/GovCommandHeader';
import { GovIntelligenceStrip } from '../../components/government/GovIntelligenceStrip';
import { GovRegionalMapWorkspace } from '../../components/government/GovRegionalMapWorkspace';
import { GovRegionalSignalMatrix } from '../../components/government/GovRegionalSignalMatrix';
import { GovForecastWorkspace } from '../../components/government/GovForecastWorkspace';
import { GovAgronomicRiskPanel } from '../../components/government/GovAgronomicRiskPanel';
import { GovAdvisoryOversight } from '../../components/government/GovAdvisoryOversight';
import { GovAlertLifecycle } from '../../components/government/GovAlertLifecycle';
import { GovScientificIntegrityPanel } from '../../components/government/GovScientificIntegrityPanel';
import { GovSystemStatus } from '../../components/government/GovSystemStatus';
import { ClimateSignalCard } from '../../components/analyst/ClimateSignalCard';
import { ProvenanceCard } from '../../components/analyst/ProvenanceCard';
import { forecastService, ForecastStatusResponse, ForecastAvailabilityResponse } from '../../services/forecastService';
import { eventService, OperationalStatusResponse, ForecastEvent } from '../../services/eventService';

export const GovernmentDashboardPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [forecastStatus, setForecastStatus] = useState<ForecastStatusResponse | null>(null);
  const [availability, setAvailability] = useState<ForecastAvailabilityResponse | null>(null);
  const [opStatus, setOpStatus] = useState<OperationalStatusResponse | null>(null);
  const [events, setEvents] = useState<ForecastEvent[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchGovData = async () => {
      try {
        const [stRes, avRes, opRes, evRes] = await Promise.all([
          forecastService.getForecastStatus().catch(() => null),
          forecastService.getForecastAvailability('UP_LKO_BKT').catch(() => null),
          eventService.getOperationalStatus().catch(() => null),
          eventService.getEvents().catch(() => null),
        ]);
        if (isMounted) {
          if (stRes?.success && stRes.data) setForecastStatus(stRes.data);
          if (avRes?.success && avRes.data) setAvailability(avRes.data);
          if (opRes?.success && opRes.data) setOpStatus(opRes.data);
          if (evRes?.success && evRes.data?.events) setEvents(evRes.data.events);
        }
      } catch (err) {
        // Fallback gracefully
      }
    };
    fetchGovData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className="min-h-screen bg-[#F3F6F7] text-[#102A43] font-sans pb-16 relative"
      data-testid="government-dashboard-page"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 relative z-10">
        {/* 1. Government Command Header */}
        <GovCommandHeader
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
        />

        {/* 2. Command Intelligence Metrics Strip */}
        <GovIntelligenceStrip
          forecastStatus={forecastStatus}
          availability={availability}
        />

        {/* 3. Regional Intelligence GIS Map */}
        <GovRegionalMapWorkspace />

        {/* 4. Regional Signal Matrix */}
        <GovRegionalSignalMatrix />

        {/* 5. Forecast Monitoring Workspace */}
        <GovForecastWorkspace />

        {/* 6. Agronomic Risk Overview */}
        <GovAgronomicRiskPanel />

        {/* 7. Advisory Oversight */}
        <GovAdvisoryOversight />

        {/* 8. Alert Lifecycle */}
        <GovAlertLifecycle events={events} />

        {/* 9. Scientific Integrity Panel */}
        <GovScientificIntegrityPanel />

        {/* 10. System Status & Technical Telemetry */}
        <GovSystemStatus opStatus={opStatus} />

        {/* 11. Large-Scale Climate Teleconnections & Scientific Provenance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="bg-white border-2 border-[#102A43] rounded-2xl p-4 shadow-[4px_4px_0px_#102A43]">
            <ClimateSignalCard />
          </div>
          <div className="bg-white border-2 border-[#102A43] rounded-2xl p-4 shadow-[4px_4px_0px_#102A43]">
            <ProvenanceCard />
          </div>
        </div>
      </div>
    </div>
  );
};
