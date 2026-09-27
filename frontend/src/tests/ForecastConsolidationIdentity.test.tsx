import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { normalizeForecastData } from '../utils/normalizeForecastData';
import { FarmerProfilePage } from '../pages/farmer/FarmerProfilePage';
import { useAuthStore } from '../stores/useAuthStore';
import { ScientificForecastRecord } from '../services/forecastService';

describe('Phase 10: Forecast Data Consolidation & Demo Identity Consistency', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: 'farmer_001',
        email: 'farmer@varshasetu.in',
        fullName: 'Ramesh Kumar',
        role: 'FARMER',
        preferredLanguage: 'hi',
        permissions: ['farmer:profile:read', 'farmer:profile:write', 'farmer:advisory:read', 'farmer:simulator:execute'],
        isActive: true,
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-27T00:00:00Z',
      },
      token: 'mock-farmer-jwt',
      refreshToken: 'mock-farmer-refresh',
      authStatus: 'AUTHENTICATED',
      error: null,
    });
  });

  describe('Demo Identity Consistency in FarmerProfilePage', () => {
    it('renders authenticated identity Ramesh Kumar with RK initials and email', () => {
      render(
        <MemoryRouter>
          <FarmerProfilePage />
        </MemoryRouter>
      );

      // Authenticated identity checks
      expect(screen.getByText('Ramesh Kumar')).toBeInTheDocument();
      expect(screen.getByText('RK')).toBeInTheDocument();
      expect(screen.getByText(/farmer@varshasetu\.in/i)).toBeInTheDocument();

      // Ensure hardcoded "Ram Lakhan" and "DEMO IDENTITY" badge are absent
      expect(screen.queryByText('Ram Lakhan')).not.toBeInTheDocument();
      expect(screen.queryByText('RL')).not.toBeInTheDocument();
      expect(screen.queryByText('DEMO IDENTITY')).not.toBeInTheDocument();
    });

    it('dynamically adapts to changing user identity from useAuthStore', () => {
      useAuthStore.setState({
        user: {
          id: 'farmer_002',
          email: 'suresh.patel@varshasetu.in',
          fullName: 'Suresh Patel',
          role: 'FARMER',
          preferredLanguage: 'hi',
          permissions: ['farmer:profile:read'],
          isActive: true,
          createdAt: '2026-09-01T00:00:00Z',
          updatedAt: '2026-09-27T00:00:00Z',
        },
      });

      render(
        <MemoryRouter>
          <FarmerProfilePage />
        </MemoryRouter>
      );

      expect(screen.getByText('Suresh Patel')).toBeInTheDocument();
      expect(screen.getByText('SP')).toBeInTheDocument();
      expect(screen.getByText(/suresh\.patel@varshasetu\.in/i)).toBeInTheDocument();
      expect(screen.queryByText('Ram Lakhan')).not.toBeInTheDocument();
    });
  });

  describe('Forecast Data Consolidation & Deduplication', () => {
    const createMockRecord = (
      id: string,
      targetType: string,
      prob: number | null,
      predVal: number | null,
      generatedAt: string
    ): ScientificForecastRecord => ({
      forecast_id: id,
      generated_at: generatedAt,
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
        target_type: targetType,
        target_definition_version: 'v1.0-imd-kharif',
        threshold: 64.5,
        unit: 'mm',
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
        probability: prob,
        predicted_value: predVal,
        category: 'MODERATE',
      },
      calibration: {
        status: 'CALIBRATED',
        calibrator_type: 'Isotonic',
      },
      uncertainty: {
        status: 'CALCULATED',
        lower_bound: 8.5,
        median: 14.2,
        upper_bound: 22.0,
        method: 'Quantile Resampling',
      },
      validation: {
        validation_status: 'VALIDATED',
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
            description: '3-day cumulative rainfall',
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
        messages: ['Diagnostic forecast only.'],
      },
    });

    it('collapses multiple repeating records into a single distinct signal by semantic key', () => {
      // 5 duplicate HEAVY_RAIN records generated at different timestamps
      const duplicateRecords: ScientificForecastRecord[] = [
        createMockRecord('fc_hr_1', 'HEAVY_RAIN', 0.18, null, '2026-09-25T10:00:00Z'),
        createMockRecord('fc_hr_2', 'HEAVY_RAIN', 0.18, null, '2026-09-25T11:00:00Z'),
        createMockRecord('fc_hr_3', 'HEAVY_RAIN', 0.19, null, '2026-09-25T12:00:00Z'),
        createMockRecord('fc_hr_4', 'HEAVY_RAIN', 0.18, null, '2026-09-25T13:00:00Z'),
        createMockRecord('fc_hr_5', 'HEAVY_RAIN', 0.182, null, '2026-09-25T14:00:00Z'),
      ];

      const result = normalizeForecastData(duplicateRecords);

      // Should be deduplicated into exactly 1 distinct signal
      expect(result.signals).toHaveLength(1);
      // Keeps the newest record (14:00:00Z)
      expect(result.signals[0].forecast_id).toBe('fc_hr_5');
      expect(result.summary.rainEventRiskPct).toBe(18);
    });

    it('preserves distinct target signals while collapsing internal duplicates', () => {
      const mixedRecords: ScientificForecastRecord[] = [
        // 3 HEAVY_RAIN duplicates
        createMockRecord('fc_hr_1', 'HEAVY_RAIN', 0.18, null, '2026-09-25T10:00:00Z'),
        createMockRecord('fc_hr_2', 'HEAVY_RAIN', 0.18, null, '2026-09-25T11:00:00Z'),
        createMockRecord('fc_hr_3', 'HEAVY_RAIN', 0.18, null, '2026-09-25T12:00:00Z'),

        // 2 RAINFALL_AMOUNT duplicates
        createMockRecord('fc_ra_1', 'RAINFALL_AMOUNT', null, 14.2, '2026-09-25T10:00:00Z'),
        createMockRecord('fc_ra_2', 'RAINFALL_AMOUNT', null, 15.0, '2026-09-25T13:00:00Z'),

        // 1 DRY_SPELL record
        createMockRecord('fc_ds_1', 'DRY_SPELL', 0.05, null, '2026-09-25T10:00:00Z'),
      ];

      const result = normalizeForecastData(mixedRecords);

      // Expect exactly 3 distinct signals: HEAVY_RAIN, RAINFALL_AMOUNT, DRY_SPELL
      expect(result.signals).toHaveLength(3);
      const targetTypes = result.signals.map((s) => s.target.target_type);
      expect(targetTypes).toContain('HEAVY_RAIN');
      expect(targetTypes).toContain('RAINFALL_AMOUNT');
      expect(targetTypes).toContain('DRY_SPELL');

      // Primary summary metrics are extracted from appropriate signals
      expect(result.summary.expectedRainfallMm).toBe(15.0);
      expect(result.summary.rainfallRange).toEqual({
        lower: 8.5,
        upper: 22.0,
        method: 'Quantile Resampling',
      });
      expect(result.summary.rainEventRiskPct).toBe(18);
      expect(result.summary.confidenceLevel).toBe('HIGH');
    });

    it('extracts unified shared scientific context from distinct signals', () => {
      const records = [
        createMockRecord('fc_hr_1', 'HEAVY_RAIN', 0.18, null, '2026-09-25T10:00:00Z'),
      ];

      const result = normalizeForecastData(records);

      expect(result.sharedContext).not.toBeNull();
      expect(result.sharedContext?.modelId).toBe('xgboost');
      expect(result.sharedContext?.spatialResolution).toBe('BLOCK');
      expect(result.sharedContext?.dataFreshness).toBe('HISTORICAL_ONLY');
      expect(result.sharedContext?.forecastHorizonDays).toBe(7);
      expect(result.sharedContext?.validFrom).toBe('2024-10-01');
      expect(result.sharedContext?.validUntil).toBe('2024-10-07');
    });
  });
});
