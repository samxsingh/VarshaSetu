import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ModelsPage } from '../pages/analyst/ModelsPage';
import { modelService } from '../services/modelService';

vi.mock('../services/modelService', () => ({
  modelService: {
    getStatus: vi.fn(),
    getExperiments: vi.fn(),
    trainBaselines: vi.fn(),
  },
}));

describe('ModelsPage Component (Phase 4A Baseline Stage)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders model registry header and baseline disclosure', async () => {
    vi.mocked(modelService.getStatus).mockResolvedValue({
      success: true,
      data: {
        service: 'varshasetu-ml-service',
        phase: 'PHASE_4A_BASELINE_STAGE',
        operational_status: 'BASELINE_EVALUATION_ACTIVE',
        operational_inference_available: false,
        message: 'Forecast models are in Phase 4A baseline evaluation stage.',
        active_baselines: ['LogisticRegressionBaseline (HEAVY_RAIN 7d, 14d)'],
        total_experiments_recorded: 3,
      },
    });

    vi.mocked(modelService.getExperiments).mockResolvedValue({
      success: true,
      data: {
        total: 1,
        experiments: [
          {
            experiment_id: 'exp_dry_spell_7d_test',
            model_name: 'LogisticRegressionBaseline',
            model_version: '1.0.0-baseline',
            feature_set_version: '1.0.0',
            target_name: 'DRY_SPELL',
            target_version: '1.0.0',
            horizon_days: 7,
            training_period: '2024-06-01 to 2024-08-20',
            validation_period: '2024-08-21 to 2024-09-08',
            test_period: '2024-09-09 to 2024-09-24',
            geography: 'UP_LKO_BKT',
            created_at: '2026-09-25T14:45:00.000Z',
            metrics: { test: { brier_score: 0.3347, sample_count: 18 } },
            comparison_to_climatology: { brier_skill_score: 0.0915, has_skill_over_climatology: true },
            calibration_status: 'NOT_CALIBRATED',
            dataset_version: '1.0.0',
            git_commit: 'e572419',
            status: 'EVALUATED',
          },
        ],
      },
    });

    render(<ModelsPage />);

    expect(screen.getByText(/Machine Learning Model & Experiment Registry/i)).toBeInTheDocument();
    expect(screen.getByText(/Train Baselines/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('PHASE_4A_BASELINE_STAGE')).toBeInTheDocument();
      expect(screen.getByText('DRY_SPELL')).toBeInTheDocument();
      expect(screen.getByText('0.3347')).toBeInTheDocument();
    });
  });
});
