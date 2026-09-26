import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ScientificChartFrame,
  ScientificLegend,
  ProbabilityBar,
  RiskDistribution,
  ForecastTimeline,
  SkillMetricCard,
  ConfidenceBand,
  DataQualityIndicator,
} from '../components/visualization';

describe('Scientific Visualization Components (Scientific Data Systems)', () => {
  describe('ScientificChartFrame', () => {
    it('renders title, provenance, status, and children', () => {
      render(
        <ScientificChartFrame
          title="Monsoon Precipitation Hyetograph"
          provenance="IMD / ERA5 Reanalysis"
          ariaLabel="Monsoon precipitation hyetograph chart"
          statusBadge={<span>CALIBRATED</span>}
        >
          <div data-testid="chart-content">Chart Body Content</div>
        </ScientificChartFrame>
      );

      expect(screen.getByText('Monsoon Precipitation Hyetograph')).toBeInTheDocument();
      expect(screen.getByText('IMD / ERA5 Reanalysis')).toBeInTheDocument();
      expect(screen.getByText('CALIBRATED')).toBeInTheDocument();
      expect(screen.getByTestId('chart-content')).toBeInTheDocument();
    });
  });

  describe('ScientificLegend', () => {
    it('renders series items with swatches', () => {
      render(
        <ScientificLegend
          items={[
            { id: 'obs', label: 'Observed Gauge (IMD)', color: '#2563EB', shape: 'circle' },
            { id: 'ens', label: 'Downscaled Ensemble Mean', color: '#0E7490', shape: 'line' },
            { id: 'ci', label: 'P10–P90 Confidence Range', color: '#DBEAFE', shape: 'square' },
            { id: 'clim', label: 'Climatological Normal', color: '#829AB1', shape: 'dashed-line' },
          ]}
        />
      );

      expect(screen.getByText('Observed Gauge (IMD)')).toBeInTheDocument();
      expect(screen.getByText('Downscaled Ensemble Mean')).toBeInTheDocument();
      expect(screen.getByText('P10–P90 Confidence Range')).toBeInTheDocument();
      expect(screen.getByText('Climatological Normal')).toBeInTheDocument();
    });
  });

  describe('ProbabilityBar', () => {
    it('renders probability value, confidence rating, and reference threshold', () => {
      render(
        <ProbabilityBar
          probability={72}
          label="Heavy Rainfall Probability"
          confidenceLabel="High (0.84)"
          confidenceLevel="high"
          threshold={60}
          thresholdLabel="Advisory Threshold (60%)"
          horizonLabel="48h Lead"
        />
      );

      expect(screen.getByText('Heavy Rainfall Probability')).toBeInTheDocument();
      expect(screen.getByText(/72%/)).toBeInTheDocument();
      expect(screen.getByText(/High \(0\.84\)/)).toBeInTheDocument();
      expect(screen.getByText(/48h Lead/)).toBeInTheDocument();
      expect(screen.getByText(/Advisory Threshold \(60%\)/)).toBeInTheDocument();
    });
  });

  describe('RiskDistribution', () => {
    it('renders segmented counts and total units', () => {
      render(
        <RiskDistribution
          title="Tehsil Risk Partition"
          items={[
            { key: 'watch', label: 'Watch', count: 2, color: 'bg-[#0891B2]' },
            { key: 'elevated', label: 'Elevated', count: 1, color: 'bg-[#D97706]' },
            { key: 'normal', label: 'Normal', count: 3, color: 'bg-[#3F7D58]' },
          ]}
          totalLabel="Total Tehsils"
        />
      );

      expect(screen.getByText('Tehsil Risk Partition')).toBeInTheDocument();
      expect(screen.getByText(/Total Tehsils/)).toBeInTheDocument();
      expect(screen.getByText('Watch')).toBeInTheDocument();
      expect(screen.getByText('Elevated')).toBeInTheDocument();
      expect(screen.getByText('Normal')).toBeInTheDocument();
    });
  });

  describe('ForecastTimeline', () => {
    it('renders process lifecycle stages in process mode', () => {
      render(
        <ForecastTimeline
          mode="process"
          title="Forecast Pipeline"
          stages={[
            { id: 'stg-1', name: 'AWS Ingestion', status: 'completed', timestamp: '06:00 IST' },
            { id: 'stg-2', name: 'ECMWF/ERA5 Run', status: 'active', timestamp: '06:30 IST' },
            { id: 'stg-3', name: 'Holdout Validation', status: 'pending' },
          ]}
        />
      );

      expect(screen.getByText('AWS Ingestion')).toBeInTheDocument();
      expect(screen.getByText('ECMWF/ERA5 Run')).toBeInTheDocument();
      expect(screen.getByText('Holdout Validation')).toBeInTheDocument();
    });

    it('renders rainfall hyetograph in rainfall mode', () => {
      render(
        <ForecastTimeline
          mode="rainfall"
          title="Precipitation Forecast Hyetograph"
          rainfallData={[
            { date: '2024-06-24', label: 'Day 1', rainfallMm: 14.2 },
            { date: '2024-06-25', label: 'Day 2', rainfallMm: 28.5, isPeak: true },
          ]}
        />
      );

      expect(screen.getByText('Precipitation Forecast Hyetograph')).toBeInTheDocument();
      expect(screen.getAllByText('Day 1').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/14\.2/).length).toBeGreaterThan(0);
      expect(screen.getAllByText('Day 2').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/28\.5/).length).toBeGreaterThan(0);
    });
  });

  describe('SkillMetricCard', () => {
    it('renders metric name, value, delta, and benchmark', () => {
      render(
        <SkillMetricCard
          label="Brier Skill Score (BSS)"
          metricKey="Climatological Gain"
          value="+19.4%"
          benchmarkRef="Climatology = 0.0%"
          benchmarkDelta="Skill over Climatology"
          interpretation="Positive values indicate genuine predictive skill"
          statusTag="Significant"
          statusVariant="positive"
        />
      );

      expect(screen.getByText('Brier Skill Score (BSS)')).toBeInTheDocument();
      expect(screen.getByText('+19.4%')).toBeInTheDocument();
      expect(screen.getByText('Climatology = 0.0%')).toBeInTheDocument();
      expect(screen.getByText('Skill over Climatology')).toBeInTheDocument();
      expect(screen.getByText('Significant')).toBeInTheDocument();
    });
  });

  describe('ConfidenceBand', () => {
    it('renders point estimate, confidence interval, and ensemble spread', () => {
      render(
        <ConfidenceBand
          pointEstimate={32.4}
          lowerBound={18.0}
          upperBound={48.5}
          unit="mm"
          ensembleMembers={51}
          label="Cumulative 7-Day Rainfall Forecast"
        />
      );

      expect(screen.getByText('Cumulative 7-Day Rainfall Forecast')).toBeInTheDocument();
      expect(screen.getByText(/32\.4/)).toBeInTheDocument();
      expect(screen.getByText(/18/)).toBeInTheDocument();
      expect(screen.getByText(/48\.5/)).toBeInTheDocument();
      expect(screen.getByText(/Ensemble: 51 members/)).toBeInTheDocument();
    });
  });

  describe('DataQualityIndicator', () => {
    it('renders telemetry and quality status badge', () => {
      render(
        <DataQualityIndicator
          sourceName="IMD Automatic Weather Station"
          sourceId="AWS-LKO-001"
          provider="IMD Pune"
          lastIngestion="12 mins ago"
          observationCount={1440}
          missingnessPct={0.4}
          latencySeconds={28}
          status="HEALTHY"
        />
      );

      expect(screen.getByText('IMD Automatic Weather Station')).toBeInTheDocument();
      expect(screen.getByText(/12 mins ago/)).toBeInTheDocument();
      expect(screen.getByText('1440')).toBeInTheDocument();
      expect(screen.getByText(/0\.4/)).toBeInTheDocument();
      expect(screen.getByText('HEALTHY')).toBeInTheDocument();
    });
  });
});
