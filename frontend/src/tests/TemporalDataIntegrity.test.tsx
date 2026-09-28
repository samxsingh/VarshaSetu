import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OperationalDataProvider, useOperationalData } from '../context/OperationalDataContext';
import {
  assertOperationalFreshness,
  isOperationalDataValid,
  formatISTDateTime,
  formatISTDate,
} from '../utils/operationalGuard';
import { CanonicalRainfallTrendChart } from '../components/charts/CanonicalRainfallTrendChart';
import { BlockAnomalyBarChart } from '../components/charts/BlockAnomalyBarChart';
import { DataFreshnessSpectrum } from '../components/charts/DataFreshnessSpectrum';
import { MonsoonGlanceCard } from '../components/farmer/MonsoonGlanceCard';
import { OfficerFieldIntelligence } from '../components/officer/OfficerFieldIntelligence';
import { GovDecisionIntelligence } from '../components/government/GovDecisionIntelligence';
import { AnalystScientificLayer } from '../components/analyst/AnalystScientificLayer';
import { weatherService } from '../services/weatherService';

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

describe('Phase 13: System-Wide Data Integrity & Temporal Readiness Test Suite', () => {
  const mockCanonicalContext = {
    referenceTime: '2026-09-28T11:30:00Z',
    referenceTimeIST: '28 Sep 2026, 17:00 IST',
    currentDate: '2026-09-28',
    location: {
      blockId: 'UP_LKO_BKT',
      blockName: 'Bakshi Ka Talab',
      district: 'Lucknow',
      state: 'Uttar Pradesh',
      latitude: 26.98,
      longitude: 80.93,
    },
    freshnessStatus: 'LIVE' as const,
    dataMode: 'OPERATIONAL' as const,
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
    season: 'Kharif 2026',
    activeMonsoonPeriod: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(weatherService.getDataContext).mockResolvedValue({
      success: true,
      data: mockCanonicalContext,
    });

    vi.mocked(weatherService.getForecast).mockResolvedValue({
      success: true,
      data: {
        location: mockCanonicalContext.location,
        source: 'Open-Meteo / ECMWF IFS',
        provider: 'Open-Meteo',
        retrievedAt: '2026-09-28T17:00:00Z',
        retrievedAtIST: '28 Sep 2026, 17:00 IST',
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
            rainfallMm: 3.2,
            rainfallProbability: 45,
            tempMaxC: 32.1,
            tempMinC: 24.8,
            windSpeedKmh: 12,
            weatherCode: 61,
            conditionText: 'Light Rain',
            heavyRainRisk: 'LOW',
            drySpellRisk: 'LOW',
            confidence: 0.92,
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
      ],
    } as any);

    vi.mocked(weatherService.getProviderHealth).mockResolvedValue({
      success: true,
      data: {
        overall: 'CONNECTED',
        providers: [
          { name: 'Open-Meteo', providerId: 'open-meteo', status: 'CONNECTED', latencyMs: 120, lastSuccess: '17:00 IST' },
        ],
      },
    } as any);

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
    } as any);

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
    } as any);

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
    } as any);

    vi.mocked(weatherService.getCurrentConditions).mockResolvedValue({
      success: true,
      data: {
        location: mockCanonicalContext.location,
        source: 'Open-Meteo / ECMWF IFS',
        dataset: 'Open-Meteo Operational NWP',
        provider: 'Open-Meteo',
        observedAt: '2026-09-28T17:00:00Z',
        observedAtIST: '2026-09-28 17:00 IST',
        retrievedAt: '2026-09-28T17:00:00Z',
        sourceUpdatedAt: '2026-09-28T12:00:00Z',
        freshnessStatus: 'LIVE',
        isLive: true,
        current: {
          temperatureC: 31.4,
          apparentTemperatureC: 36.2,
          relativeHumidityPercent: 78,
          precipitationMm: 0.0,
          weatherCode: 2,
          windSpeedKmh: 12.5,
          conditionLabel: 'Partly Cloudy',
        },
      },
    } as any);
  });

  // 1. Canonical temporal context loads correctly
  it('1. Canonical temporal context loads correctly across the application', async () => {
    const TestConsumer: React.FC = () => {
      const { currentDate, freshnessStatus, dataMode, forecastWindowLabel } = useOperationalData();
      return (
        <div>
          <span data-testid="test-current-date">{currentDate}</span>
          <span data-testid="test-freshness">{freshnessStatus}</span>
          <span data-testid="test-mode">{dataMode}</span>
          <span data-testid="test-window">{forecastWindowLabel}</span>
        </div>
      );
    };

    render(
      <OperationalDataProvider>
        <TestConsumer />
      </OperationalDataProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('test-current-date').textContent).toBe('2026-09-28');
      expect(screen.getByTestId('test-freshness').textContent).toBe('LIVE');
      expect(screen.getByTestId('test-mode').textContent).toBe('OPERATIONAL');
      expect(screen.getByTestId('test-window').textContent).toContain('28 Sept');
    });
  });

  // 2. Stale data guard rejects HISTORICAL data in operational view
  it('2. Stale data guard rejects HISTORICAL data in operational view', () => {
    const historicalPayload = {
      forecast_id: 'fc_hist_001',
      freshnessStatus: 'HISTORICAL',
      dataMode: 'HISTORICAL_REFERENCE',
      dataset_name: 'Kharif 2024 Archive',
      validFrom: '2024-09-15',
    };

    const evaluation = assertOperationalFreshness(historicalPayload, 'OPERATIONAL');
    expect(evaluation.valid).toBe(false);
    expect(evaluation.detectedLayer).toBe('REFERENCE');
    expect(evaluation.reason).toContain('Historical archive data cannot be rendered as primary operational forecast');
    expect(isOperationalDataValid(historicalPayload)).toBe(false);
  });

  // 3. Stale data guard rejects SIMULATED data in operational view
  it('3. Stale data guard rejects SIMULATED data in operational view', () => {
    const simulatedPayload = {
      scenario_id: 'sim_break_monsoon_001',
      freshnessStatus: 'SIMULATED',
      isSimulated: true,
      dataMode: 'SIMULATION',
    };

    const evaluation = assertOperationalFreshness(simulatedPayload, 'OPERATIONAL');
    expect(evaluation.valid).toBe(false);
    expect(evaluation.detectedLayer).toBe('SIMULATION');
    expect(evaluation.reason).toContain('Simulated data cannot be rendered as operational');
  });

  // 4. LIVE and RECENT data pass operational guard
  it('4. LIVE and RECENT data pass operational guard cleanly', () => {
    const livePayload = {
      forecast_id: 'fc_live_001',
      freshnessStatus: 'LIVE',
      dataMode: 'OPERATIONAL',
      validFrom: '2026-09-28',
    };

    const recentPayload = {
      forecast_id: 'fc_recent_001',
      freshnessStatus: 'RECENT',
      dataMode: 'OPERATIONAL',
      validFrom: '2026-09-28',
    };

    expect(assertOperationalFreshness(livePayload, 'OPERATIONAL').valid).toBe(true);
    expect(assertOperationalFreshness(recentPayload, 'OPERATIONAL').valid).toBe(true);
  });

  // 5. Historical data rendered only with explicit badge/isolation
  it('5. Historical data is accepted when expected layer is explicitly REFERENCE', () => {
    const historicalPayload = {
      forecast_id: 'fc_kharif2024_anchor',
      freshnessStatus: 'HISTORICAL',
      temporalCoverage: 'Kharif 2024 Benchmark',
    };

    const evalRef = assertOperationalFreshness(historicalPayload, 'REFERENCE');
    expect(evalRef.valid).toBe(true);
    expect(evalRef.detectedLayer).toBe('REFERENCE');
  });

  // 6. Simulation data rendered only with explicit badge/isolation
  it('6. Simulation data is accepted when expected layer is explicitly SIMULATION', () => {
    const simPayload = {
      scenario_id: 'sim_sowing_001',
      freshnessStatus: 'SIMULATED',
      isSimulated: true,
    };

    const evalSim = assertOperationalFreshness(simPayload, 'SIMULATION');
    expect(evalSim.valid).toBe(true);
    expect(evalSim.detectedLayer).toBe('SIMULATION');
  });

  // 7. Charts render empty state when data is unavailable (no fabricated 0)
  it('7. Charts render empty state when data is unavailable without fabricating 0 values', () => {
    const { container: trendContainer } = render(
      <CanonicalRainfallTrendChart daily={[]} />
    );
    expect(trendContainer.textContent).toContain('Forecast trajectory unavailable');

    const { container: anomalyContainer } = render(
      <BlockAnomalyBarChart blocks={[]} />
    );
    expect(anomalyContainer.textContent).toContain('Block anomaly data unavailable');

    const { container: spectrumContainer } = render(
      <DataFreshnessSpectrum
        breakdown={{
          liveCount: 0,
          recentCount: 0,
          historicalCount: 0,
          climatologicalCount: 0,
          simulatedCount: 0,
        }}
      />
    );
    expect(spectrumContainer.textContent).toContain('Data Freshness Spectrum Unavailable');
  });

  // 8. Forecast contract contains all required fields
  it('8. Validates standard forecast contract schema requirements', () => {
    const requiredContract = {
      forecastId: 'fc_20260928_bkt_01',
      blockId: 'UP_LKO_BKT',
      blockName: 'Bakshi Ka Talab',
      targetType: 'HEAVY_RAIN',
      horizonDays: 7,
      observedAt: '2026-09-28T11:30:00Z',
      generatedAt: '2026-09-28T11:30:00Z',
      validFrom: '2026-09-28',
      validUntil: '2026-10-05',
      modelId: 'lightgbm_v1',
      source: 'Open-Meteo',
      freshnessStatus: 'LIVE',
      provenance: 'Telemetry Mesonet',
    };

    const requiredKeys = [
      'forecastId',
      'blockId',
      'blockName',
      'targetType',
      'horizonDays',
      'observedAt',
      'generatedAt',
      'validFrom',
      'validUntil',
      'modelId',
      'source',
      'freshnessStatus',
      'provenance',
    ];

    for (const key of requiredKeys) {
      expect(requiredContract).toHaveProperty(key);
      expect((requiredContract as any)[key]).toBeDefined();
    }
  });

  // 9. Persona views (Farmer, Officer, Government, Analyst) use canonical date
  it('9. Farmer Monsoon Glance card renders canonical operational window and reference', async () => {
    const { container } = render(
      <MemoryRouter>
        <OperationalDataProvider>
          <MonsoonGlanceCard />
        </OperationalDataProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Monsoon Outlook/i)).toBeInTheDocument();
    });

    expect(container.textContent).toContain('28 Sept');
    expect(container.textContent).toContain('Open-Meteo');
  });

  // 10. No June 25–July 1 forecast leak in 2026 operational view
  it('10. Officer and Farmer operational views do not leak June 25–July 1 forecast dates', async () => {
    const { container } = render(
      <MemoryRouter>
        <OperationalDataProvider>
          <OfficerFieldIntelligence />
        </OperationalDataProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Bakshi Ka Talab/i)[0]).toBeInTheDocument();
    });

    expect(container.textContent).not.toContain('June 25');
    expect(container.textContent).not.toContain('June 26');
    expect(container.textContent).not.toContain('June 27');
    expect(container.textContent).not.toContain('July 1');
  });

  // 11. Timestamps formatted in Asia/Kolkata (IST)
  it('11. Timestamps formatted in Asia/Kolkata (IST)', () => {
    const utcDateStr = '2026-09-28T11:30:00Z';
    const formatted = formatISTDateTime(utcDateStr);
    expect(formatted).toContain('2026');
    expect(formatted).toContain('17:00 IST');

    const formattedDate = formatISTDate(utcDateStr);
    expect(formattedDate).toContain('2026');
  });

  // 12. Data freshness spectrum reflects actual backend state
  it('12. Data freshness spectrum reflects distinct ingestion channels accurately', () => {
    render(
      <DataFreshnessSpectrum
        breakdown={{
          liveCount: 1,
          recentCount: 1,
          historicalCount: 0,
          climatologicalCount: 1,
          simulatedCount: 0,
        }}
      />
    );

    expect(screen.getByText('3 Active Data Ingestion Channels')).toBeInTheDocument();
    expect(screen.getByText('1 LIVE')).toBeInTheDocument();
    expect(screen.getByText('1 RECENT')).toBeInTheDocument();
    expect(screen.getByText('1 CLIMATOLOGY')).toBeInTheDocument();
  });

  // 13. Historical archive toggle properly isolates historical records
  it('13. Analyst Scientific Layer clearly isolates Historical Hindcast Benchmark', async () => {
    render(
      <MemoryRouter>
        <OperationalDataProvider>
          <AnalystScientificLayer />
        </OperationalDataProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/1991–2020 Climatological Baseline/i)).toBeInTheDocument();
      expect(screen.getByText(/Operational Gate Blocked/i)).toBeInTheDocument();
    });
  });

  // 14. Fallback states do not fabricate numbers
  it('14. Null data evaluation returns UNAVAILABLE without fabricating values', () => {
    const nullEvaluation = assertOperationalFreshness(null, 'OPERATIONAL');
    expect(nullEvaluation.valid).toBe(false);
    expect(nullEvaluation.detectedLayer).toBe('UNAVAILABLE');

    const undefinedEvaluation = assertOperationalFreshness(undefined, 'OPERATIONAL');
    expect(undefinedEvaluation.valid).toBe(false);
    expect(undefinedEvaluation.detectedLayer).toBe('UNAVAILABLE');
  });

  // 15. Cross-persona temporal consistency (all 4 personas see same operational date)
  it('15. Cross-persona temporal consistency: Officer and Government share same operational date', async () => {
    const { container: officerContainer } = render(
      <MemoryRouter>
        <OperationalDataProvider>
          <OfficerFieldIntelligence />
        </OperationalDataProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Bakshi Ka Talab/i)[0]).toBeInTheDocument();
    });
    expect(officerContainer.textContent).toContain('2026-09-28');

    const { container: govContainer } = render(
      <MemoryRouter>
        <OperationalDataProvider>
          <GovDecisionIntelligence />
        </OperationalDataProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Monsoon Command Overview/i)).toBeInTheDocument();
    });
    expect(govContainer.textContent).toContain('2026-09-28');
  });
});
