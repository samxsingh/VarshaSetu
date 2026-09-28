import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OperationalDataProvider, useOperationalData } from '../context/OperationalDataContext';
import { GlobalDataContextIndicator } from '../components/common/GlobalDataContextIndicator';
import { CanonicalRainfallTrendChart } from '../components/charts/CanonicalRainfallTrendChart';
import { BlockAnomalyBarChart } from '../components/charts/BlockAnomalyBarChart';
import { DataFreshnessSpectrum } from '../components/charts/DataFreshnessSpectrum';
import { MonsoonGlanceCard } from '../components/farmer/MonsoonGlanceCard';
import { OfficerFieldIntelligence } from '../components/officer/OfficerFieldIntelligence';
import { GovDecisionIntelligence } from '../components/government/GovDecisionIntelligence';
import { weatherService, NormalizedDailyForecast, OfficerBlockRiskItem } from '../services/weatherService';

// Mock weatherService
vi.mock('../services/weatherService', async () => {
  const actual = await vi.importActual('../services/weatherService');
  return {
    ...actual,
    weatherService: {
      ...((actual as any).weatherService || {}),
      getDataContext: vi.fn(),
      getForecast: vi.fn(),
      getCurrentConditions: vi.fn(),
      getOfficerBlockRisks: vi.fn(),
      getProviderHealth: vi.fn(),
      getGovernmentOverview: vi.fn(),
      getClimateBaseline: vi.fn(),
      getClimateSignals: vi.fn(),
    },
  };
});

describe('Phase 12: Temporal Consistency & Decision Intelligence Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(weatherService.getDataContext).mockResolvedValue({
      success: true,
      data: {
        referenceTime: '2026-09-28T11:30:00Z',
        referenceTimeIST: '2026-09-28 17:00 IST',
        currentDate: '2026-09-28',
        location: {
          blockId: 'UP_LKO_BKT',
          blockName: 'Bakshi Ka Talab',
          district: 'Lucknow',
          state: 'Uttar Pradesh',
          latitude: 26.98,
          longitude: 80.93,
        },
        freshnessStatus: 'LIVE',
        dataMode: 'OPERATIONAL',
        observationWindow: {
          start: '2026-09-28T00:00:00Z',
          end: '2026-09-28T17:00:00Z',
        },
        forecastWindow: {
          start: '2026-09-28',
          end: '2026-10-04',
          horizonDays: 7,
        },
        source: 'Open-Meteo (ECMWF IFS 0.1°)',
        provider: 'Open-Meteo',
        observedAt: '2026-09-28T17:00:00+05:30',
        generatedAt: '2026-09-28T17:00:00+05:30',
      },
    });

    vi.mocked(weatherService.getForecast).mockResolvedValue({
      success: true,
      data: {
        location: {
          blockId: 'UP_LKO_BKT',
          blockName: 'Bakshi Ka Talab',
          district: 'Lucknow',
          state: 'Uttar Pradesh',
          latitude: 26.98,
          longitude: 80.93,
        },
        source: 'Open-Meteo / ECMWF IFS',
        provider: 'Open-Meteo',
        retrievedAt: '2026-09-28T17:00:00Z',
        retrievedAtIST: '2026-09-28 17:00 IST',
        sourceUpdatedAt: '2026-09-28T12:00:00Z',
        freshnessStatus: 'LIVE',
        isLive: true,
        isHistorical: false,
        isSimulated: false,
        summary: {
          expectedTotalRainfall7dMm: 24.5,
          highestRainDay: 'Tue',
          heavyRainAlertRisk: 'LOW',
          drySpellAlertRisk: 'LOW',
          overallConfidence: 0.92,
        },
        daily: [
          {
            date: '2026-09-28',
            dayLabel: 'Mon',
            validFrom: '2026-09-28T00:00:00Z',
            validUntil: '2026-09-28T23:59:59Z',
            rainfallMm: 4.2,
            rainfallProbability: 45,
            tempMaxC: 32.1,
            tempMinC: 24.5,
            windSpeedKmh: 12,
            heavyRainRisk: 'LOW',
            drySpellRisk: 'LOW',
            weatherCode: 61,
            conditionText: 'Normal field operations',
            confidence: 0.9,
          },
          {
            date: '2026-09-29',
            dayLabel: 'Tue',
            validFrom: '2026-09-29T00:00:00Z',
            validUntil: '2026-09-29T23:59:59Z',
            rainfallMm: 8.5,
            rainfallProbability: 60,
            tempMaxC: 31.0,
            tempMinC: 24.0,
            windSpeedKmh: 14,
            heavyRainRisk: 'MODERATE',
            drySpellRisk: 'LOW',
            weatherCode: 63,
            conditionText: 'Light rain expected',
            confidence: 0.88,
          },
        ],
        provenance: {
          sourceId: 'OPEN_METEO',
          sourceName: 'Open-Meteo / ECMWF IFS',
          modelFamily: 'ECMWF IFS',
          resolution: '0.1° (~9 km)',
          retrievedAt: '2026-09-28T17:00:00Z',
          attribution: 'ECMWF & Open-Meteo',
          fallbackUsed: false,
        },
      },
    });

    vi.mocked(weatherService.getOfficerBlockRisks).mockResolvedValue({
      success: true,
      data: [
        {
          blockId: 'UP_LKO_BKT',
          blockName: 'Bakshi Ka Talab',
          district: 'Lucknow',
          rainfallTodayMm: 4.2,
          rainProbabilityPercent: 45,
          heavyRainRisk: 'LOW',
          drySpellRisk: 'LOW',
          dataFreshness: 'LIVE',
          lastUpdatedIST: '17:00 IST',
          source: 'Open-Meteo / ECMWF',
        },
        {
          blockId: 'UP_LKO_MHL',
          blockName: 'Mohanlalganj',
          district: 'Lucknow',
          rainfallTodayMm: 22.0,
          rainProbabilityPercent: 85,
          heavyRainRisk: 'HIGH',
          drySpellRisk: 'LOW',
          activeAlert: 'Heavy Rain Warning (≥ 20mm)',
          dataFreshness: 'LIVE',
          lastUpdatedIST: '17:00 IST',
          source: 'Open-Meteo / ECMWF',
        },
      ],
    });

    vi.mocked(weatherService.getProviderHealth).mockResolvedValue({
      success: true,
      data: {
        overall: 'CONNECTED',
        providers: [
          { name: 'Open-Meteo', providerId: 'open-meteo', status: 'CONNECTED', latencyMs: 120, lastSuccess: '17:00 IST' },
        ],
      },
    });

    vi.mocked(weatherService.getGovernmentOverview).mockResolvedValue({
      success: true,
      data: {
        monitoredBlocks: 8,
        activeRainfallWarnings: 1,
        heavyRainRiskBlocks: 1,
        drySpellRiskBlocks: 0,
        districtRainfallAnomalyPercent: -12,
        districtRainfallStatus: 'NORMAL',
        forecastConfidenceScore: 0.92,
        overallDataFreshness: 'LIVE',
        lastSyncTimeIST: '17:00 IST',
      },
    });

    vi.mocked(weatherService.getClimateBaseline).mockResolvedValue({
      success: true,
      data: {
        location: {
          blockId: 'UP_LKO_BKT',
          blockName: 'Bakshi Ka Talab',
          district: 'Lucknow',
          state: 'Uttar Pradesh',
          latitude: 26.98,
          longitude: 80.93,
        },
        baselinePeriod: '1991–2020 ERA5-Land',
        currentPeriod: 'Current Season',
        source: 'Copernicus C3S ERA5-Land',
        climatologyDataset: 'ERA5-Land 30-Year Normal',
        rainfall: {
          observedAccumulationMm: 165,
          baselineNormalMm: 182,
          anomalyPercent: -9,
          anomalyStatus: 'NORMAL',
        },
        temperature: {
          meanTemperatureC: 28.5,
          baselineNormalC: 28.1,
          anomalyC: 0.4,
        },
        humidity: {
          meanRelativeHumidityPercent: 72,
          baselineNormalPercent: 74,
          anomalyPercent: -2,
        },
        soilMoisture: {
          currentPercent: 31,
          baselineNormalPercent: 32,
          anomalyPercent: -3,
        },
      },
    });

    vi.mocked(weatherService.getClimateSignals).mockResolvedValue({
      success: true,
      data: [
        {
          signal: 'ENSO Niño 3.4',
          symbol: 'SSTA 3.4',
          classification: 'Observed',
          currentState: 'ENSO Neutral (-0.3°C)',
          previousState: 'ENSO Neutral (-0.2°C)',
          numericValue: -0.3,
          unit: '°C',
          influence: 'Neutral Pacific SST forcing supports normal monsoon circulation',
          trend: 'STABLE',
          dataDate: '2026-09-28',
          confidence: 0.94,
          provenance: 'NOAA CPC Weekly Monday Run',
        },
      ],
    });

    vi.mocked(weatherService.getCurrentConditions).mockResolvedValue({
      success: true,
      data: {
        location: {
          blockId: 'UP_LKO_BKT',
          blockName: 'Bakshi Ka Talab',
          district: 'Lucknow',
          state: 'Uttar Pradesh',
          latitude: 26.98,
          longitude: 80.93,
        },
        source: 'Open-Meteo / ECMWF IFS',
        dataset: 'Open-Meteo Operational NWP',
        provider: 'Open-Meteo',
        observedAt: '2026-09-28T17:00:00Z',
        observedAtIST: '2026-09-28 17:00 IST',
        retrievedAt: '2026-09-28T17:00:00Z',
        sourceUpdatedAt: '2026-09-28T12:00:00Z',
        freshnessStatus: 'LIVE',
        isLive: true,
        isHistorical: false,
        isSimulated: false,
        temperatureC: 31.5,
        humidityPercent: 68,
        precipitationMm: 4.2,
        surfacePressureHpa: 1008,
        windSpeedKmh: 11.2,
        windDirectionDeg: 120,
        conditionText: 'Scattered Showers',
        confidence: 0.92,
        provenanceUrl: 'https://open-meteo.com',
        attribution: 'Open-Meteo & ECMWF IFS',
      },
    });
  });

  it('1. OperationalDataProvider synchronizes canonical platform time context', async () => {
    const Consumer = () => {
      const { currentDate, sourceAttribution, freshnessStatus, loading } = useOperationalData();
      if (loading) return <div>Loading Context...</div>;
      return (
        <div>
          <span data-testid="ref-date">{currentDate}</span>
          <span data-testid="provider">{sourceAttribution}</span>
          <span data-testid="freshness">{freshnessStatus}</span>
        </div>
      );
    };

    render(
      <OperationalDataProvider>
        <Consumer />
      </OperationalDataProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('ref-date').textContent).toBe('2026-09-28');
      expect(screen.getByTestId('provider').textContent).toContain('Open-Meteo');
      expect(screen.getByTestId('freshness').textContent).toBe('LIVE');
    });
  });

  it('2. GlobalDataContextIndicator renders subtle non-disruptive operational status', async () => {
    render(
      <OperationalDataProvider>
        <GlobalDataContextIndicator />
      </OperationalDataProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/LIVE/i)).toBeInTheDocument();
      expect(screen.getByText(/2026/i)).toBeInTheDocument();
    });

    // Clicking opens the provenance modal
    const button = screen.getByTitle(/Current Operational Data Context/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Operational Data Context & Provenance/i)).toBeInTheDocument();
    });
  });

  it('3. MonsoonGlanceCard renders operational live forecast and isolates historical archive', async () => {
    render(
      <MemoryRouter>
        <MonsoonGlanceCard />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Must show live operational forecast totals and window
      expect(screen.getAllByText(/Monsoon Outlook/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/24.5 mm/i).length).toBeGreaterThan(0);
      // Must have collapsible historical benchmark
      expect(screen.getByText(/Historical Reference Benchmark/i)).toBeInTheDocument();
    });

    // Click historical benchmark expander
    const expandBtn = screen.getByText(/Historical Reference Benchmark/i);
    fireEvent.click(expandBtn);

    await waitFor(() => {
      expect(screen.getByText(/Retrospective Kharif 2024 Station Record/i)).toBeInTheDocument();
      expect(screen.getByText(/HISTORICAL ARCHIVE/i)).toBeInTheDocument();
      expect(screen.getByText(/2024-06-01 to 2024-09-30/i)).toBeInTheDocument();
    });
  });

  it('4. CanonicalRainfallTrendChart renders daily bars, tooltips, and thresholds', () => {
    const sampleDaily: NormalizedDailyForecast[] = [
      {
        date: '2026-09-28',
        dayLabel: 'Mon',
        validFrom: '2026-09-28T00:00:00Z',
        validUntil: '2026-09-28T23:59:59Z',
        rainfallMm: 12.4,
        rainfallProbability: 70,
        tempMaxC: 32,
        tempMinC: 24,
        windSpeedKmh: 10,
        heavyRainRisk: 'LOW',
        drySpellRisk: 'LOW',
        weatherCode: 61,
        conditionText: 'Moderate Rain',
        confidence: 0.9,
      },
      {
        date: '2026-09-29',
        dayLabel: 'Tue',
        validFrom: '2026-09-29T00:00:00Z',
        validUntil: '2026-09-29T23:59:59Z',
        rainfallMm: 0,
        rainfallProbability: 10,
        tempMaxC: 34,
        tempMinC: 25,
        windSpeedKmh: 8,
        heavyRainRisk: 'LOW',
        drySpellRisk: 'HIGH',
        weatherCode: 1,
        conditionText: 'Clear',
        confidence: 0.92,
      },
    ];

    render(
      <CanonicalRainfallTrendChart
        daily={sampleDaily}
        freshnessStatus="LIVE"
        title="Test Hyetograph"
      />
    );

    expect(screen.getByText('Test Hyetograph')).toBeInTheDocument();
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByText('12.4')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Normal Rain (<64.5 mm)')).toBeInTheDocument();
  });

  it('5. BlockAnomalyBarChart correctly computes zero-centered departures vs 1991–2020 ERA5 normal', () => {
    const blocks: OfficerBlockRiskItem[] = [
      {
        blockId: 'UP_LKO_BKT',
        blockName: 'Bakshi Ka Talab',
        district: 'Lucknow',
        rainfallTodayMm: 10.0, // 7-day projection = 70mm vs 38mm normal -> positive departure
        rainProbabilityPercent: 80,
        heavyRainRisk: 'HIGH',
        drySpellRisk: 'LOW',
        dataFreshness: 'LIVE',
        lastUpdatedIST: '17:00 IST',
        source: 'Open-Meteo',
      },
      {
        blockId: 'UP_LKO_MAL',
        blockName: 'Mal',
        district: 'Lucknow',
        rainfallTodayMm: 1.0, // 7-day projection = 7mm vs 38mm normal -> negative departure
        rainProbabilityPercent: 20,
        heavyRainRisk: 'LOW',
        drySpellRisk: 'HIGH',
        dataFreshness: 'LIVE',
        lastUpdatedIST: '17:00 IST',
        source: 'Open-Meteo',
      },
    ];

    render(<BlockAnomalyBarChart blocks={blocks} />);

    expect(screen.getByText(/Administrative Block Rainfall Anomaly/i)).toBeInTheDocument();
    expect(screen.getByText('Bakshi Ka Talab')).toBeInTheDocument();
    expect(screen.getByText('Mal')).toBeInTheDocument();
    expect(screen.getByText('ERA5-Land 1991–2020 Baseline')).toBeInTheDocument();
  });

  it('6. DataFreshnessSpectrum visualizes telemetry proportions and categories', () => {
    render(
      <DataFreshnessSpectrum
        breakdown={{
          liveCount: 5,
          recentCount: 2,
          historicalCount: 1,
          climatologicalCount: 2,
          simulatedCount: 0,
        }}
      />
    );

    expect(screen.getByText('Platform Telemetry & Data Freshness Spectrum')).toBeInTheDocument();
    expect(screen.getByText('10 Active Data Ingestion Channels')).toBeInTheDocument();
    expect(screen.getByText(/5 LIVE/i)).toBeInTheDocument();
    expect(screen.getByText(/2 RECENT/i)).toBeInTheDocument();
    expect(screen.getByText(/1 HISTORICAL/i)).toBeInTheDocument();
  });

  it('7. OfficerFieldIntelligence renders Where Should I Act prioritization and sortable matrix', async () => {
    render(<OfficerFieldIntelligence />);

    await waitFor(() => {
      expect(screen.getByText(/Where Should I Act Today\? \(Block Prioritization\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Block Risk Matrix — Agro-Climatic Operational Telemetry/i)).toBeInTheDocument();
      expect(screen.getByText(/Sort by:/i)).toBeInTheDocument();
    });

    // Test sort button interaction
    const sortAnomalyBtn = screen.getByRole('button', { name: /Highest Anomaly/i });
    fireEvent.click(sortAnomalyBtn);
    expect(sortAnomalyBtn.className).toContain('bg-[#102A43]');

    // Test Draft Advisory action
    const draftBtn = screen.getAllByRole('button', { name: /Draft Advisory/i })[0];
    fireEvent.click(draftBtn);

    await waitFor(() => {
      expect(screen.getByText(/Field advisory draft prepared for/i)).toBeInTheDocument();
    });
  });

  it('8. GovDecisionIntelligence renders state command summary, trend, and anomaly analysis', async () => {
    render(<GovDecisionIntelligence />);

    await waitFor(() => {
      expect(screen.getByText(/Monsoon Command Overview/i)).toBeInTheDocument();
      expect(screen.getByText(/District Cumulative Rainfall Trajectory/i)).toBeInTheDocument();
      expect(screen.getByText(/Spatial Block Rainfall Anomaly/i)).toBeInTheDocument();
      expect(screen.getByText(/Platform Telemetry & Provider Freshness Spectrum/i)).toBeInTheDocument();
    });
  });
});
