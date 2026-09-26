import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  ConfidenceIndicator,
  SignalExplanation,
  ProvenanceDrawer,
  ScientificEvidencePanel,
} from '../components/visualization';

describe('Scientific Evidence, Explainability & Trust Layer (Phase 9)', () => {
  describe('ConfidenceIndicator', () => {
    it('renders probability, confidence badge, and distinction notice', () => {
      render(
        <ConfidenceIndicator
          probability={78}
          confidenceLevel="HIGH"
          confidenceScore={0.84}
          uncertaintyRange={{ lower: 65, upper: 89, unit: '%', method: 'Quantile Resampling' }}
          baselineReference="Climatological Normal: 35%"
          label="Heavy Rainfall Event Risk"
        />
      );

      expect(screen.getByText('Heavy Rainfall Event Risk')).toBeInTheDocument();
      expect(screen.getByText(/Statistical Probability ≠ Predictive Certainty/i)).toBeInTheDocument();
      expect(screen.getByText(/HIGH CONFIDENCE/i)).toBeInTheDocument();
      expect(screen.getByText('78%')).toBeInTheDocument();
      expect(screen.getByText('65 – 89%')).toBeInTheDocument();
      expect(screen.getByText('Climatological Normal: 35%')).toBeInTheDocument();
    });

    it('handles NOT_CONFIGURED confidence status gracefully without fabrication', () => {
      render(
        <ConfidenceIndicator
          probability={null}
          confidenceLevel="NOT_CONFIGURED"
          label="Experimental Dry Spell Metric"
        />
      );

      expect(screen.getByText(/CONFIDENCE NOT CONFIGURED/i)).toBeInTheDocument();
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('renders scientific definitions when showDefinitions is true', () => {
      render(
        <ConfidenceIndicator
          probability={55}
          confidenceLevel="MEDIUM"
          showDefinitions={true}
        />
      );

      expect(screen.getByText(/Scientific Definition:/i)).toBeInTheDocument();
      expect(screen.getByText(/Probability reflects the calibrated fraction of ensemble members/i)).toBeInTheDocument();
    });
  });

  describe('SignalExplanation', () => {
    const mockFeatures = [
      {
        name: 'Precipitable Water Influx',
        domain: 'moisture' as const,
        impact: 'increases_risk' as const,
        contributionValue: 0.35,
        observationValue: '54 mm',
        description: 'Deep columnar moisture convergence over Lucknow basin.',
        farmerFriendlyNote: 'Moisture buildup indicates rain clouds gathering.',
      },
      {
        name: 'Monsoon Trough Shear',
        domain: 'wind' as const,
        impact: 'decreases_risk' as const,
        contributionValue: -0.15,
        observationValue: '12 kts',
        description: 'Trough axis deflected northward towards foothills.',
        farmerFriendlyNote: 'Wind shift pushing cloud bands towards north.',
      },
    ];

    it('renders domain signals and mandatory non-causal disclaimer', () => {
      render(
        <SignalExplanation
          title="Monsoon Indicator Signals"
          features={mockFeatures}
          targetEvent="Heavy Rainfall"
          mode="detailed"
        />
      );

      expect(screen.getByText('Monsoon Indicator Signals')).toBeInTheDocument();
      expect(screen.getByText('Precipitable Water Influx')).toBeInTheDocument();
      expect(screen.getByText('Monsoon Trough Shear')).toBeInTheDocument();
      expect(screen.getByText(/Non-Causal Diagnostic Disclaimer:/i)).toBeInTheDocument();
      expect(screen.getByText(/do not represent isolated deterministic physical causes/i)).toBeInTheDocument();
    });

    it('renders farmer-friendly note in farmer mode', () => {
      render(
        <SignalExplanation
          features={mockFeatures}
          targetEvent="Rain Forecast"
          mode="farmer"
        />
      );

      expect(screen.getByText('Moisture buildup indicates rain clouds gathering.')).toBeInTheDocument();
    });
  });

  describe('ProvenanceDrawer', () => {
    it('does not render when isOpen is false', () => {
      render(
        <ProvenanceDrawer
          isOpen={false}
          onClose={() => {}}
          title="Telemetry Ledger"
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders telemetry lineage, calibration metrics, and closes on user action', () => {
      const handleClose = vi.fn();

      render(
        <ProvenanceDrawer
          isOpen={true}
          onClose={handleClose}
          title="Scientific Provenance & Traceability Ledger"
          targetId="FCST_UP_LKO_BKT_001"
          provenance={{
            dataSource: 'IMD AWS Station Mesh (UP_LKO_BKT)',
            spatialResolution: '0.25° (~27 km)',
            stationsCovered: 1,
            temporalCoverage: 'Kharif 2024 Reference Normals',
            observationTimestamp: '2024-09-15T06:00:00Z',
            freshnessLatency: 'HISTORICAL_ONLY',
            modelPipeline: 'VarshaSetu Ensemble Engine v2.3',
            calibrator: 'Isotonic Regression',
            eceScore: '0.038',
            brierScore: '+0.28 vs Climatology',
            validationStatus: 'VALIDATED_STABLE',
          }}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('RECORD ID: FCST_UP_LKO_BKT_001')).toBeInTheDocument();
      expect(screen.getByText('IMD AWS Station Mesh (UP_LKO_BKT)')).toBeInTheDocument();
      expect(screen.getByText('VarshaSetu Ensemble Engine v2.3')).toBeInTheDocument();
      expect(screen.getByText('Isotonic Regression')).toBeInTheDocument();
      expect(screen.getByText('VALIDATED_STABLE')).toBeInTheDocument();

      // Close button
      const closeBtn = screen.getByRole('button', { name: /Close provenance drawer/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('ScientificEvidencePanel', () => {
    it('integrates WHAT, WHY, WHERE, and HOW CONFIDENT across perspectives', () => {
      render(
        <ScientificEvidencePanel
          targetName="Heavy Rainfall (> 64.5 mm)"
          horizonLabel="7-Day Horizon"
          eventProbability={62}
          eventCategory="Elevated Watch"
          explanationSummary="Synoptic moisture surge combines with localized convective potential."
          telemetrySource="IMD Lucknow Mesonet (AWS)"
          stationCoverage="18 Active Gauges"
          confidenceLevel="HIGH"
          confidenceScore={0.88}
          initiallyOpen={true}
        />
      );

      // WHAT
      expect(screen.getByText(/1. What Is The System Showing\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Heavy Rainfall \(> 64.5 mm\) — Categorical Alert: Elevated Watch/i)).toBeInTheDocument();

      // HOW CONFIDENT
      expect(screen.getByText('62%')).toBeInTheDocument();
      expect(screen.getByText(/HIGH CONFIDENCE/i)).toBeInTheDocument();

      // WHY
      expect(screen.getByText(/Atmospheric Signals Driving This Forecast/i)).toBeInTheDocument();

      // WHERE
      expect(screen.getByText(/3. Observational Lineage: IMD Lucknow Mesonet \(AWS\)/i)).toBeInTheDocument();
      expect(screen.getByText(/18 Active Gauges/i)).toBeInTheDocument();
    });
  });
});
