import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ModelsPage } from '../pages/analyst/ModelsPage';
import { modelService } from '../services/modelService';

vi.mock('../services/modelService', () => ({
  modelService: {
    getStatus: vi.fn(),
    getComparison: vi.fn(),
    getModelExplanations: vi.fn(),
    getDatasetsCatalog: vi.fn(),
    getExperiments: vi.fn(),
    trainTreeModel: vi.fn(),
    getCalibrationStatus: vi.fn(),
    getCalibrationComparison: vi.fn(),
    getCalibrationModelReliability: vi.fn(),
  },
}));

describe('ModelsPage Component (Phase 4B Tree Downscaling Stage)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders downscaling model benchmark registry and SHAP explainability panel', async () => {
    vi.mocked(modelService.getStatus).mockResolvedValue({
      success: true,
      data: {
        service: 'varshasetu-ml-service',
        phase: 'PHASE_4B_OPERATIONAL_DOWNSCALING_STAGE',
        operational_status: 'DOWNSCALING_BENCHMARK_ACTIVE',
        spatial_resolution_supported: 'BLOCK',
        total_experiments_recorded: 4,
      },
    });

    vi.mocked(modelService.getComparison).mockResolvedValue({
      success: true,
      data: {
        benchmark_report: {
          target_name: 'HEAVY_RAIN',
          horizon_days: 7,
          task_type: 'classification',
          evaluation_period: '2024-09-13 to 2024-09-30',
          test_sample_count: 18,
          climatology_reference_val: 0.1667,
          models: [
            {
              model_id: 'climatology',
              model_name: 'Historical Climatology Frequency',
              model_family: 'climatology',
              task_type: 'classification',
              brier_score: 0.1389,
              brier_skill_score: 0.0,
              accuracy: 0.8333,
              is_calibrated: true,
              has_skill_over_climatology: false,
              status: 'evaluated',
            },
            {
              model_id: 'xgboost',
              model_name: 'XGBoost Gradient Boosted Trees',
              model_family: 'xgboost',
              task_type: 'classification',
              brier_score: 0.112,
              brier_skill_score: 0.1937,
              accuracy: 0.8889,
              is_calibrated: false,
              has_skill_over_climatology: true,
              status: 'evaluated',
            },
          ],
          notes: [],
        },
        data_availability: {
          status: 'PARTIAL',
          has_30_year_climatology: false,
          spatial_resolution_level: 'BLOCK',
        },
        downscaling_resolution: {
          target_resolution: 'BLOCK',
          panchayat_data_available: false,
        },
      },
    });

    vi.mocked(modelService.getModelExplanations).mockResolvedValue({
      success: true,
      data: {
        model_id: 'xgboost_heavy_rain_7d',
        target_name: 'HEAVY_RAIN',
        sample_count_evaluated: 18,
        top_driver: 'rainfall_1d',
        secondary_driver: 'humidity',
        teleconnection_importance_pct: 18.5,
        global_importances: [
          {
            feature_name: 'rainfall_1d',
            mean_abs_shap: 0.42,
            relative_importance_pct: 35.0,
            meteorological_category: 'moisture_antecedent',
          },
        ],
      },
    });

    vi.mocked(modelService.getDatasetsCatalog).mockResolvedValue({
      success: true,
      data: {
        status: 'success',
        total_datasets: 1,
        catalog: [
          {
            dataset_id: 'weather_lucknow_observations',
            name: 'Lucknow Kharif 2024 Weather Observations',
            provider: 'ERA5-Land',
            spatial_resolution: 'Block centroid (~9 km)',
            temporal_resolution: 'Daily',
            qc_passed: true,
          },
        ],
      },
    });

    vi.mocked(modelService.getExperiments).mockResolvedValue({
      success: true,
      data: {
        total: 0,
        experiments: [],
      },
    });

    vi.mocked(modelService.getCalibrationStatus).mockResolvedValue({
      success: true,
      data: {
        service: 'varshasetu-calibration-engine',
        phase: 'PHASE_4C_CALIBRATION_RELIABILITY_STAGE',
        calibration_status: 'INSUFFICIENT_DATA',
        operational_calibration_active: false,
        active_calibrator_type: 'NONE',
        gate_status: 'INSUFFICIENT_DATA',
        diagnostics_available: true,
        reason: 'Current dataset has 122 observations (Kharif 2024 single-season).',
      },
    });

    vi.mocked(modelService.getCalibrationComparison).mockResolvedValue({
      success: true,
      data: {
        target_name: 'HEAVY_RAIN',
        horizon_days: 7,
        gate_status: 'INSUFFICIENT_DATA',
        comparison: [],
      },
    });

    vi.mocked(modelService.getCalibrationModelReliability).mockResolvedValue({
      success: true,
      data: {
        model_id: 'xgboost',
        target_name: 'HEAVY_RAIN',
        horizon_days: 7,
        reliability_diagram: {
          brier_score: 0.112,
          brier_skill_score: 0.1937,
          expected_calibration_error: 0.082,
          maximum_calibration_error: 0.145,
          sample_size: 18,
          brier_decomposition: {
            reliability: 0.021,
            resolution: 0.045,
            uncertainty: 0.136,
            brier_score: 0.112,
          },
          bins: [
            { bin_index: 0, bin_lower: 0.0, bin_upper: 0.1, mean_predicted_probability: 0.05, observed_frequency: 0.0, sample_count: 10, is_empty: false },
            { bin_index: 1, bin_lower: 0.1, bin_upper: 0.2, mean_predicted_probability: 0.15, observed_frequency: 0.2, sample_count: 5, is_empty: false },
          ],
        },
      },
    });

    render(<ModelsPage />);

    expect(
      screen.getByText(/Operational Downscaling & Model Benchmark Registry/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Train Tree Ensembles/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('XGBoost Gradient Boosted Trees')).toBeInTheDocument();
      expect(screen.getByText(/Historical Climatology Frequency/i)).toBeInTheDocument();
      expect(screen.getByText(/SHAP Explainability: Feature Attributions & Teleconnections/i)).toBeInTheDocument();
      expect(screen.getByText(/Lucknow Kharif 2024 Weather Observations/i)).toBeInTheDocument();
    });
  });
});
