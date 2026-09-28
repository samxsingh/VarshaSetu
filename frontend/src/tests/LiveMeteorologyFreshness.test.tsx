import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataFreshnessBadge } from '../components/common/DataFreshnessBadge';
import { DecisionFlowDiagram } from '../components/common/DecisionFlowDiagram';
import { ProvenanceModal } from '../components/common/ProvenanceModal';
import { FarmerLiveWeatherSection } from '../components/farmer/FarmerLiveWeatherSection';
import { OfficerFieldIntelligence } from '../components/officer/OfficerFieldIntelligence';
import { GovDecisionIntelligence } from '../components/government/GovDecisionIntelligence';
import { AnalystScientificLayer } from '../components/analyst/AnalystScientificLayer';
import { weatherService } from '../services/weatherService';

vi.mock('../services/weatherService', () => ({
  weatherService: {
    getCurrentConditions: vi.fn(),
    getForecast: vi.fn(),
    getSyncStatus: vi.fn(),
    getOfficerBlockRisks: vi.fn(),
    getGovernmentOverview: vi.fn(),
    getClimateSignals: vi.fn(),
    getClimateBaseline: vi.fn(),
    getProviderHealth: vi.fn(),
  },
}));

describe('Phase 11: System-wide Data Freshness, Live Ingestion & Decision Intelligence', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (weatherService.getCurrentConditions as any).mockResolvedValue({
      success: true,
      data: {
        source: 'Open-Meteo / ECMWF IFS & DWD ICON',
        provider: 'OPEN_METEO_ECMWF',
        dataset: 'Open-Meteo High-Resolution Gridded Model',
        location: {
          state: 'Uttar Pradesh',
          district: 'Lucknow',
          blockId: 'UP_LKO_BKT',
          blockName: 'Bakshi Ka Talab',
          latitude: 26.9749,
          longitude: 80.9276,
        },
        observedAt: '2026-09-28T10:00:00Z',
        observedAtIST: '2026-09-28 15:30 IST',
        retrievedAt: '2026-09-28T10:05:00Z',
        sourceUpdatedAt: '2026-09-28T10:00:00Z',
        freshnessStatus: 'LIVE',
        isLive: true,
        isHistorical: false,
        isSimulated: false,
        temperatureC: 30.5,
        humidityPercent: 62,
        precipitationMm: 1.2,
        surfacePressureHpa: 994.2,
        windSpeedKmh: 7.5,
        windDirectionDeg: 310,
        conditionText: 'Partly Cloudy',
        confidence: 0.94,
        provenanceUrl: 'https://open-meteo.com',
        attribution: 'Open-Meteo Weather API',
      },
    });

    (weatherService.getForecast as any).mockResolvedValue({
      success: true,
      data: {
        location: {
          state: 'Uttar Pradesh',
          district: 'Lucknow',
          blockId: 'UP_LKO_BKT',
          blockName: 'Bakshi Ka Talab',
          latitude: 26.9749,
          longitude: 80.9276,
        },
        source: 'Open-Meteo / ECMWF IFS',
        provider: 'OPEN_METEO_ECMWF',
        retrievedAt: '2026-09-28T10:05:00Z',
        retrievedAtIST: '28 Sep 2026, 15:35 IST',
        sourceUpdatedAt: '2026-09-28T10:00:00Z',
        freshnessStatus: 'LIVE',
        isLive: true,
        isHistorical: false,
        isSimulated: false,
        daily: [
          {
            date: '2026-09-28',
            dayLabel: 'Mon',
            validFrom: '2026-09-28T00:00:00+05:30',
            validUntil: '2026-09-28T23:59:59+05:30',
            rainfallMm: 2.5,
            rainfallProbability: 35,
            tempMinC: 23,
            tempMaxC: 32,
            windSpeedKmh: 8,
            heavyRainRisk: 'LOW',
            drySpellRisk: 'LOW',
            weatherCode: 2,
            conditionText: 'Partly Cloudy',
            confidence: 0.91,
          },
          {
            date: '2026-09-29',
            dayLabel: 'Tue',
            validFrom: '2026-09-29T00:00:00+05:30',
            validUntil: '2026-09-29T23:59:59+05:30',
            rainfallMm: 14.0,
            rainfallProbability: 65,
            tempMinC: 22,
            tempMaxC: 30,
            windSpeedKmh: 12,
            heavyRainRisk: 'MODERATE',
            drySpellRisk: 'LOW',
            weatherCode: 61,
            conditionText: 'Slight Rain',
            confidence: 0.91,
          },
        ],
        summary: {
          expectedTotalRainfall7dMm: 24.5,
          highestRainDay: '2026-09-29',
          heavyRainAlertRisk: 'MODERATE',
          drySpellAlertRisk: 'LOW',
          overallConfidence: 0.91,
        },
        provenance: {
          sourceId: 'OPEN_METEO_ECMWF',
          sourceName: 'Open-Meteo',
          modelFamily: 'ECMWF IFS',
          resolution: '0.1° (~9 km)',
          retrievedAt: '2026-09-28T10:05:00Z',
          attribution: 'ECMWF IFS open data',
          fallbackUsed: false,
        },
      },
    });

    (weatherService.getOfficerBlockRisks as any).mockResolvedValue({
      success: true,
      data: [
        {
          blockId: 'UP_LKO_BKT',
          blockName: 'Bakshi Ka Talab',
          district: 'Lucknow',
          rainfallTodayMm: 1.2,
          rainProbabilityPercent: 35,
          heavyRainRisk: 'LOW',
          drySpellRisk: 'LOW',
          dataFreshness: 'LIVE',
          source: 'Open-Meteo',
          lastUpdatedIST: '28 Sep 2026, 15:30 IST',
        },
        {
          blockId: 'UP_LKO_MAL',
          blockName: 'Malihabad',
          district: 'Lucknow',
          rainfallTodayMm: 0.0,
          rainProbabilityPercent: 20,
          heavyRainRisk: 'LOW',
          drySpellRisk: 'MODERATE',
          dataFreshness: 'LIVE',
          source: 'Open-Meteo',
          lastUpdatedIST: '28 Sep 2026, 15:30 IST',
        },
      ],
    });

    (weatherService.getGovernmentOverview as any).mockResolvedValue({
      success: true,
      data: {
        monitoredBlocks: 8,
        activeRainfallWarnings: 1,
        heavyRainRiskBlocks: 0,
        drySpellRiskBlocks: 2,
        districtRainfallAnomalyPercent: -12,
        districtRainfallStatus: 'NORMAL',
        overallDataFreshness: 'LIVE',
        forecastConfidenceScore: 0.92,
        lastSyncTimeIST: '28 Sep 2026, 15:30 IST',
      },
    });

    (weatherService.getClimateSignals as any).mockResolvedValue({
      success: true,
      data: [
        {
          signal: 'El Niño Southern Oscillation (ENSO)',
          symbol: 'Niño 3.4',
          currentState: 'ENSO-Neutral',
          previousState: 'ENSO-Neutral',
          numericValue: -0.42,
          unit: '°C anomaly',
          trend: 'STRENGTHENING',
          influence: 'Neutral circulation',
          dataDate: '2026-09-28',
          classification: 'Observed',
          confidence: 0.92,
          provenance: 'NOAA CPC',
        },
      ],
    });

    (weatherService.getClimateBaseline as any).mockResolvedValue({
      success: true,
      data: {
        location: {
          state: 'Uttar Pradesh',
          district: 'Lucknow',
          blockId: 'UP_LKO_BKT',
          blockName: 'Bakshi Ka Talab',
          latitude: 26.9749,
          longitude: 80.9276,
        },
        baselinePeriod: '1991–2020 (WMO 30-Year Climatology)',
        currentPeriod: 'Monsoon Cumulative',
        source: 'Copernicus C3S ERA5-Land',
        climatologyDataset: 'ERA5-Land Reanalysis',
        rainfall: {
          observedAccumulationMm: 165.2,
          baselineNormalMm: 182.4,
          anomalyPercent: -12,
          anomalyStatus: 'NORMAL',
        },
        temperature: {
          meanTemperatureC: 28.5,
          baselineNormalC: 28.2,
          anomalyC: 0.3,
        },
        humidity: {
          meanRelativeHumidityPercent: 71,
          baselineNormalPercent: 74,
          anomalyPercent: -4,
        },
        soilMoisture: {
          currentPercent: 30,
          baselineNormalPercent: 32,
          anomalyPercent: -6,
        },
      },
    });

    (weatherService.getProviderHealth as any).mockResolvedValue({
      success: true,
      data: {
        overall: 'CONNECTED',
        providers: [
          { name: 'IMD AWS', providerId: 'IMD_NATIONAL_MET', status: 'DEGRADED' },
          { name: 'Open-Meteo', providerId: 'OPEN_METEO_ECMWF', status: 'CONNECTED' },
          { name: 'NASA POWER', providerId: 'NASA_POWER_AGRO', status: 'CONNECTED' },
        ],
      },
    });
  });

  describe('1. DataFreshnessBadge', () => {
    it('renders LIVE badge with pulsating dot and attribution', () => {
      render(<DataFreshnessBadge status="LIVE" source="Open-Meteo" updatedAtIST="15:30 IST" />);
      expect(screen.getByText(/LIVE INGESTION/i)).toBeInTheDocument();
      expect(screen.getByText(/Open-Meteo/i)).toBeInTheDocument();
      expect(screen.getByText(/15:30 IST/i)).toBeInTheDocument();
    });

    it('renders HISTORICAL and RECENT badges with distinct styling', () => {
      const { rerender } = render(<DataFreshnessBadge status="HISTORICAL" source="ERA5" />);
      expect(screen.getByText(/HISTORICAL BASELINE/i)).toBeInTheDocument();

      rerender(<DataFreshnessBadge status="RECENT" source="NASA POWER" />);
      expect(screen.getByText(/RECENT ANALYSIS/i)).toBeInTheDocument();
    });
  });

  describe('2. DecisionFlowDiagram', () => {
    it('renders correct 4-step pipeline for Farmer role', () => {
      render(<DecisionFlowDiagram role="FARMER" />);
      expect(screen.getByText('WEATHER')).toBeInTheDocument();
      expect(screen.getByText('CROP STAGE')).toBeInTheDocument();
      expect(screen.getByText('RISK')).toBeInTheDocument();
      expect(screen.getByText('RECOMMENDATION')).toBeInTheDocument();
    });

    it('renders correct 5-step pipeline for Government role', () => {
      render(<DecisionFlowDiagram role="GOVERNMENT" />);
      expect(screen.getByText('DATA')).toBeInTheDocument();
      expect(screen.getByText('RISK')).toBeInTheDocument();
      expect(screen.getByText('BLOCK IMPACT')).toBeInTheDocument();
      expect(screen.getByText('ALERT')).toBeInTheDocument();
      expect(screen.getByText('ACTION')).toBeInTheDocument();
    });
  });

  describe('3. FarmerLiveWeatherSection', () => {
    it('renders current conditions telemetry and forecast charts', async () => {
      render(<FarmerLiveWeatherSection />);

      await waitFor(() => {
        expect(screen.getByText(/Current Conditions — Bakshi Ka Talab/i)).toBeInTheDocument();
      });

      expect(screen.getByText('30.5°C')).toBeInTheDocument();
      expect(screen.getByText('1.2 mm')).toBeInTheDocument();
      expect(screen.getByText('62%')).toBeInTheDocument();
      expect(screen.getByText('7.5 km/h')).toBeInTheDocument();
      expect(screen.getByText(/Next 7 Days — Agrometeorological Outlook/i)).toBeInTheDocument();
    });

    it('switches between chart views (Rainfall, Probability, Temperature, Risk)', async () => {
      render(<FarmerLiveWeatherSection />);

      await waitFor(() => {
        expect(screen.getByText(/Rain Prob \(%\)/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Rain Prob \(%\)/i));
      expect(screen.getByText(/Probabilities reflect ECMWF IFS ensemble/i)).toBeInTheDocument();

      fireEvent.click(screen.getByText(/Temp \(°C\)/i));
      expect(screen.getByText(/Daily diurnal temperature range predicted/i)).toBeInTheDocument();

      fireEvent.click(screen.getByText(/Risk Timeline/i));
      expect(screen.getByText(/Risk thresholds calibrated to Central Uttar Pradesh/i)).toBeInTheDocument();
    });
  });

  describe('4. OfficerFieldIntelligence', () => {
    it('renders field conditions overview and cross-block risk matrix', async () => {
      render(<OfficerFieldIntelligence />);

      await waitFor(() => {
        expect(screen.getByText(/Field Conditions Overview — Lucknow District/i)).toBeInTheDocument();
      });

      expect(screen.getAllByText('Bakshi Ka Talab')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Malihabad')[0]).toBeInTheDocument();
      expect(screen.getByText(/Meteorological Data Health & Quality Panel/i)).toBeInTheDocument();
      expect(screen.getByText('IMD AWS / ARG')).toBeInTheDocument();
      expect(screen.getByText('Open-Meteo / ECMWF')).toBeInTheDocument();
    });
  });

  describe('5. GovDecisionIntelligence', () => {
    it('renders executive summary KPIs and decision charts', async () => {
      render(<GovDecisionIntelligence />);

      await waitFor(() => {
        expect(screen.getByText(/Monsoon Command Overview/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/District Cumulative Rainfall/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Rainfall Anomaly/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/District Vulnerability Distribution/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Freshness Spectrum|Data Freshness/i)[0]).toBeInTheDocument();
    });
  });

  describe('6. AnalystScientificLayer', () => {
    it('renders planetary forcing telemetry, anomalies, and active dataset catalog', async () => {
      render(<AnalystScientificLayer />);

      await waitFor(() => {
        expect(screen.getByText(/Large-Scale Climate Signal Telemetry/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/El Niño Southern Oscillation \(ENSO\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Climate Anomaly Analysis — Current Season vs 30-Year Normals/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Dataset Catalog & Pipeline Telemetry/i)).toBeInTheDocument();
      expect(screen.getByText('Copernicus C3S ERA5-Land')).toBeInTheDocument();
      expect(screen.getByText('Multi-Horizon Forecast Verification & Skill Evaluation')).toBeInTheDocument();
      expect(screen.getByText(/Not evaluated yet/i)).toBeInTheDocument();
    });
  });

  describe('7. ProvenanceModal', () => {
    it('displays complete scientific provenance record and closes cleanly', () => {
      const handleClose = vi.fn();
      render(
        <ProvenanceModal
          isOpen={true}
          onClose={handleClose}
          details={{
            title: 'Current Conditions & 7-Day Forecast',
            source: 'Open-Meteo / ECMWF IFS',
            dataset: 'High-Resolution Gridded NWP',
            observedAtIST: '28 Sep 2026, 15:30 IST',
            retrievedAtIST: '28 Sep 2026, 15:35 IST',
            resolution: 'Block Centroid (~9 km)',
            modelFamily: 'ECMWF IFS',
            fallbackUsed: true,
            fallbackChain: ['IMD unauthenticated (delegated to Open-Meteo)'],
          }}
        />
      );

      expect(screen.getByText('SCIENTIFIC DATA PROVENANCE RECORD')).toBeInTheDocument();
      expect(screen.getByText('Open-Meteo / ECMWF IFS')).toBeInTheDocument();
      expect(screen.getByText('28 Sep 2026, 15:30 IST')).toBeInTheDocument();
      expect(screen.getByText(/IMD unauthenticated/i)).toBeInTheDocument();

      fireEvent.click(screen.getByText('Close Provenance'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
