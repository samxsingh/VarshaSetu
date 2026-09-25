import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FarmerForecastPage } from '../pages/farmer/FarmerForecastPage';
import { forecastService } from '../services/forecastService';

describe('FarmerForecastPage Component (Phase 4E Scientific Forecast Products)', () => {
  const mockForecasts = [
    {
      forecast_id: 'fc_heavy_rain_7d_test',
      generated_at: '2026-09-25T15:00:00Z',
      valid_from: '2024-10-01',
      valid_until: '2024-10-07',
      location: {
        state_id: 'UP',
        district_id: 'UP_LKO',
        block_id: 'UP_LKO_BKT',
        latitude: 26.9749,
        longitude: 80.9276,
        spatial_resolution: 'BLOCK',
      },
      target: {
        target_type: 'HEAVY_RAIN',
        target_definition_version: 'v1.0-imd-kharif',
        threshold: 64.5,
        unit: 'probability',
      },
      horizon: {
        horizon_days: 7,
        horizon_label: '7-Day Medium-Range Planning Outlook',
      },
      model: {
        model_id: 'xgboost',
        model_family: 'Gradient Boosted Decision Trees',
        model_version: '1.0.0',
        training_period: '2024-06-01 to 2024-07-31',
        dataset_fingerprint: '3fec50c2ef89dbfc',
      },
      prediction: {
        probability: 0.182,
        predicted_value: null,
        category: 'MODERATE',
      },
      calibration: {
        status: 'NOT_CALIBRATED',
        calibrator_type: 'NONE',
      },
      uncertainty: {
        status: 'NOT_AVAILABLE',
        method: 'NONE',
      },
      validation: {
        validation_status: 'INSUFFICIENT_DATA',
        validation_years: [2024],
      },
      explainability: {
        status: 'EXPLAINED',
        top_features: [
          {
            feature: 'rainfall_3d',
            category: 'Antecedent Moisture',
            shap_value: 0.042,
            direction: 'elevates',
            magnitude: 0.042,
            description: '3-day cumulative rainfall (12.4mm) elevates predicted event probability.',
          },
        ],
      },
      data: {
        source_status: 'IMD_ERA5_INGESTED',
        freshness_status: 'HISTORICAL_ONLY',
        missingness: 0.0,
        feature_coverage: '19/19 features complete',
      },
      scientific_disclosure: {
        status: 'DIAGNOSTIC_ONLY',
        messages: ['Diagnostic forecast for block UP_LKO_BKT.'],
      },
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(forecastService, 'getForecasts').mockResolvedValue({
      success: true,
      data: {
        total_forecasts: 1,
        forecasts: mockForecasts as any,
      },
      meta: {
        timestamp: new Date().toISOString(),
        dataMode: 'REAL',
      },
    });
  });

  it('renders header with non-operational diagnostic badges and historical dataset disclosure', async () => {
    render(<FarmerForecastPage />);

    expect(screen.getByText('Hyperlocal Scientific Forecast Products')).toBeInTheDocument();
    expect(screen.getByText('Diagnostic forecast — not operational')).toBeInTheDocument();
    expect(screen.getByText('Historical dataset — not current weather')).toBeInTheDocument();
  });

  it('renders forecast cards with probability and model metadata', async () => {
    render(<FarmerForecastPage />);

    await waitFor(() => {
      expect(screen.getByText('HEAVY RAIN')).toBeInTheDocument();
      expect(screen.getByText('18%')).toBeInTheDocument();
      expect(screen.getByText('xgboost')).toBeInTheDocument();
    });
  });

  it('expands scientific explanation drawer when clicked', async () => {
    render(<FarmerForecastPage />);

    await waitFor(() => {
      expect(screen.getByText('HEAVY RAIN')).toBeInTheDocument();
    });

    const whyBtn = screen.getByText(/Why this forecast\?/i);
    fireEvent.click(whyBtn);

    await waitFor(() => {
      expect(screen.getByText(/Associated Model Signals/i)).toBeInTheDocument();
      expect(screen.getByText(/3-day cumulative rainfall/i)).toBeInTheDocument();
    });
  });

  it('does NOT contain farmer agronomic action commands in meteorological forecast view', async () => {
    const { container } = render(<FarmerForecastPage />);

    await waitFor(() => {
      expect(screen.getByText('HEAVY RAIN')).toBeInTheDocument();
    });

    const text = container.textContent?.toLowerCase() || '';
    expect(text).not.toMatch(/\byou should sow\b/);
    expect(text).not.toMatch(/\bspray immediately\b/);
    expect(text).not.toMatch(/\birrigate now\b/);
    expect(text).not.toMatch(/\bharvest now\b/);
  });
});
