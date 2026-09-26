import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { SignalExplanation, AtmosphericFeature } from './SignalExplanation';
import { ProvenanceDrawer, ProvenanceDetails } from './ProvenanceDrawer';
import { Database, ShieldCheck, HelpCircle, Layers, Compass, ArrowRight } from 'lucide-react';

export interface ScientificEvidencePanelProps {
  // WHAT
  targetName: string; // e.g. "Heavy Rainfall > 64.5 mm"
  horizonLabel?: string; // e.g. "Day 1–3 Horizon"
  eventProbability?: number | null; // e.g. 0.74 or 74
  eventCategory?: string; // e.g. "Elevated Risk"

  // WHY
  atmosphericFeatures?: AtmosphericFeature[];
  explanationSummary?: string;

  // WHERE
  telemetrySource?: string;
  stationCoverage?: number | string;
  dataFreshness?: string;
  provenance?: ProvenanceDetails;

  // HOW CONFIDENT
  confidenceLevel?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_CONFIGURED';
  confidenceScore?: number;
  uncertaintyRange?: {
    lower: number;
    upper: number;
    unit?: string;
    method?: string;
  };
  baselineReference?: string;

  // Configuration
  persona?: 'farmer' | 'officer' | 'government' | 'analyst';
  initiallyOpen?: boolean;
  className?: string;
}

export const ScientificEvidencePanel: React.FC<ScientificEvidencePanelProps> = ({
  targetName,
  horizonLabel = '72-Hour Operational Horizon',
  eventProbability,
  eventCategory = 'Monsoon Event',
  atmosphericFeatures,
  explanationSummary,
  telemetrySource = 'IMD AWS Station Network + ECMWF SEAS5',
  stationCoverage,
  dataFreshness = 'Updated 45 mins ago',
  provenance,
  confidenceLevel = 'HIGH',
  confidenceScore,
  uncertaintyRange,
  baselineReference = 'Climatological Normal: 32%',
  persona = 'officer',
  initiallyOpen = false,
  className,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(initiallyOpen);

  return (
    <div
      role="region"
      aria-label={`Scientific Evidence & Explainability for ${targetName}`}
      className={cn(
        'bg-white rounded-xl border-2 border-[#102A43] shadow-[3px_3px_0px_#102A43] overflow-hidden',
        className
      )}
    >
      {/* Top Banner / Summary Strip */}
      <div className="p-3.5 bg-[#F3F6F7] border-b-2 border-[#102A43] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-1.5 bg-[#102A43] text-white rounded-lg shrink-0">
            <Compass className="w-4 h-4 text-[#0891B2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-black text-xs text-[#102A43] uppercase tracking-wider">
                Scientific Evidence & Trust
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#EAF0F2] text-[#0E7490] border border-[#102A43]/20">
                {horizonLabel}
              </span>
            </div>
            <p className="text-[11px] text-[#486581] mt-0.5">
              Target: <strong className="text-[#102A43]">{targetName}</strong> ({eventCategory})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EAF0F2] hover:bg-[#F3F6F7] text-[#102A43] text-xs font-mono font-bold rounded-lg border border-[#102A43] transition-colors cursor-pointer"
            aria-label="View source telemetry and model provenance"
          >
            <Database className="w-3.5 h-3.5 text-[#0E7490]" />
            <span>VIEW PROVENANCE</span>
          </button>

          <button
            type="button"
            onClick={() => setPanelOpen(!panelOpen)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#102A43] hover:bg-[#0B1F33] text-white text-xs font-mono font-bold rounded-lg border border-[#102A43] transition-colors cursor-pointer"
            aria-expanded={panelOpen}
          >
            <span>{panelOpen ? 'HIDE EVIDENCE' : 'EXPLORE EVIDENCE'}</span>
          </button>
        </div>
      </div>

      {/* Explanatory Body */}
      {panelOpen && (
        <div className="p-4 sm:p-5 space-y-4 bg-white animate-in fade-in duration-200">
          {/* Question 1: WHAT is the system showing? */}
          <div className="p-3 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15">
            <span className="text-[10px] font-mono font-bold text-[#829AB1] uppercase block">
              1. What Is The System Showing?
            </span>
            <div className="mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-heading font-black text-[#102A43]">
                {targetName} — Categorical Alert: {eventCategory}
              </span>
              <span className="text-[11px] font-mono text-[#486581]">
                Baseline: {baselineReference}
              </span>
            </div>
            {explanationSummary && (
              <p className="text-xs text-[#486581] mt-1.5 leading-relaxed">
                {explanationSummary}
              </p>
            )}
          </div>

          {/* Question 4: HOW CONFIDENT should the user be? */}
          <ConfidenceIndicator
            probability={eventProbability}
            confidenceLevel={confidenceLevel}
            confidenceScore={confidenceScore}
            uncertaintyRange={uncertaintyRange}
            baselineReference={baselineReference}
            label={targetName}
            showDefinitions={persona === 'analyst' || persona === 'government'}
          />

          {/* Question 2: WHY is it showing this signal? */}
          <SignalExplanation
            title="Atmospheric Signals Driving This Forecast"
            targetEvent={targetName}
            features={atmosphericFeatures}
            mode={persona === 'farmer' ? 'farmer' : 'detailed'}
          />

          {/* Question 3: WHERE did the evidence come from? (Telemetry Summary) */}
          <div className="p-3 bg-[#EAF0F2] rounded-xl border border-[#102A43]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3F7D58] shrink-0" />
              <div>
                <span className="font-mono font-bold text-[#102A43] block">
                  3. Observational Lineage: {telemetrySource}
                </span>
                <span className="text-[10px] font-mono text-[#486581]">
                  Freshness: {dataFreshness} • Station Coverage: {stationCoverage || 'District Mesonet'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="text-[11px] font-mono font-bold text-[#0E7490] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Audit Chain</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Slide-out Drawer */}
      <ProvenanceDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`Provenance: ${targetName}`}
        targetId={provenance?.fingerprintHash ? provenance.fingerprintHash.substring(0, 12) : undefined}
        provenance={provenance}
      />
    </div>
  );
};
