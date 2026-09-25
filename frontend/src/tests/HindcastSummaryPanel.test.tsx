import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HindcastSummaryPanel } from '../components/analyst/HindcastSummaryPanel';

describe('HindcastSummaryPanel Component (Phase 4D Multi-Year Validation & Hindcasting)', () => {
  const mockStatus = {
    phase: 'PHASE_4D_MULTIYEAR_HINDCASTING_STAGE',
    operational_validation_allowed: false,
    multiyear_gate_status: 'INSUFFICIENT_DATA',
    total_experiments_recorded: 1,
    years_available: [2024],
    complete_seasons: [2024],
    scientific_disclosure:
      'Historical hindcast validation reflects only the years and variables actually available to the system.',
  };

  const mockGate = {
    gate_report: {
      status: 'INSUFFICIENT_DATA',
      years_available: [2024],
      total_years: 1,
      complete_seasons: [2024],
      eligible_years: [],
      excluded_years: [2024],
      exclusion_reasons: [
        'Available observation years (1) is less than the required minimum (5 seasons).',
      ],
      schema_consistent: true,
      fingerprint_consistent: true,
      operational_validation_allowed: false,
      scientific_notes:
        'Current observational archive contains only 1 season(s). Multi-year operational validation is scientifically gated and inactive.',
    },
  };

  const mockFolds = {
    total_folds: 2,
    folds: [
      {
        fold_id: 'fold_diagnostic_midseason',
        train_start: '2024-06-01',
        train_end: '2024-07-31',
        validation_start: '2024-08-01',
        validation_end: '2024-08-30',
        test_start: '2024-08-31',
        test_end: '2024-09-30',
        test_year: 2024,
        training_rows: 61,
        validation_rows: 30,
        test_rows: 31,
        training_years: [2024],
        feature_cutoff: '2024-07-31',
        dataset_fingerprint: '3fec50c2ef89dbfc',
        notes: 'Diagnostic within-season chronological walk-forward fold.',
      },
    ],
  };

  const mockResults = {
    experiment: {
      experiment_id: 'hindcast_heavy_rain_7d_test',
      target_name: 'HEAVY_RAIN',
      horizon_days: 7,
      models_evaluated: ['climatology', 'baseline_linear', 'xgboost', 'lightgbm'],
      spatial_resolution: 'BLOCK',
      multiyear_gate_status: 'INSUFFICIENT_DATA',
      operational_validation_allowed: false,
      dataset_fingerprint: '3fec50c2ef89dbfc',
      model_results: [
        {
          model_id: 'climatology',
          model_name: 'Empirical Climatology',
          metrics: { brier_score: 0.1389, brier_skill_score: null, log_loss: 0.412 },
          calibration_status: 'UNAVAILABLE',
          data_status: 'EVALUATED',
        },
        {
          model_id: 'xgboost',
          model_name: 'XGBoost Gradient Boosted Trees',
          metrics: {
            brier_score: 0.112,
            brier_skill_score: 0.1937,
            log_loss: 0.354,
            roc_auc: null, // Test single class safety
            expected_calibration_error: 0.082,
          },
          calibration_status: 'NOT_CALIBRATED',
          data_status: 'EVALUATED',
        },
      ],
      horizon_reports: [],
      warnings: ['Operational validation inactive due to single-season data limits.'],
    },
  };

  const mockStability = {
    stability: {
      target_name: 'HEAVY_RAIN',
      horizon_days: 7,
      model_id: 'xgboost',
      years_evaluated: [2024],
      total_years: 1,
      stability_status: 'INSUFFICIENT_SEASONS',
      notes:
        'Historical record spans 1 season(s). Cross-season stability requires >= 3 observation seasons.',
      distribution_stats: {
        brier_score: { mean: 0.112, median: 0.112, std: 0.0, min: 0.112, max: 0.112, iqr: 0.0 },
      },
      yearly_reports: [],
      degraded_years: [],
    },
  };

  const mockDrift = {
    drift_report: {
      status: 'STABLE',
      reference_period: 'Early Season (2024-06-01 to 2024-07-31)',
      comparison_period: 'Late Season (2024-08-01 to 2024-09-30)',
      total_features_evaluated: 2,
      features_with_shift: [],
      drift_results: [
        {
          feature_name: 'rainfall_lag1',
          psi: 0.042,
          ks_statistic: 0.125,
          ks_p_value: 0.65,
          is_drifted: false,
          drift_severity: 'NEGLIGIBLE' as const,
          early_mean: 6.4,
          late_mean: 5.8,
        },
      ],
      scientific_notes: 'Within-season feature distributions are stable.',
    },
  };

  const mockCoverage = {
    coverage_report: {
      total_features: 1,
      features_full_coverage: 1,
      features_partial_coverage: 0,
      temporal_span: '2024-06-01 to 2024-09-30',
      coverage_items: [
        {
          feature_name: 'rainfall_lag1',
          source: 'IMD Station / Gridded',
          first_date: '2024-06-01',
          last_date: '2024-09-30',
          total_days: 122,
          missing_days: 0,
          missing_pct: 0.0,
          data_quality: 'COMPLETE',
        },
      ],
      scientific_notes: 'All core features have complete coverage.',
    },
  };

  it('renders panel header with Multi-Year Gate status and data disclosures', () => {
    render(
      <HindcastSummaryPanel
        status={mockStatus}
        gate={mockGate}
        folds={mockFolds}
        results={mockResults}
        stability={mockStability}
        drift={mockDrift}
        coverage={mockCoverage}
        selectedTarget="HEAVY_RAIN"
        selectedHorizon={7}
      />
    );

    expect(screen.getByText(/Multi-Year Validation, Hindcasting & Forecast Skill Evaluation/i)).toBeInTheDocument();
    expect(screen.getByText(/Operational Validation Inactive/i)).toBeInTheDocument();
    expect(screen.getByText(/GATE: INSUFFICIENT_DATA/i)).toBeInTheDocument();
  });

  it('renders the scientific disclosure banner regarding archive limits', () => {
    render(
      <HindcastSummaryPanel
        status={mockStatus}
        gate={mockGate}
        folds={mockFolds}
        results={mockResults}
        stability={mockStability}
        drift={mockDrift}
        coverage={mockCoverage}
        selectedTarget="HEAVY_RAIN"
        selectedHorizon={7}
      />
    );

    expect(screen.getByText(/Scientific Disclosure & Data Reality Gate/i)).toBeInTheDocument();
    expect(screen.getByText(/ARCHIVE: 1 YEAR \/ 5 REQUIRED/i)).toBeInTheDocument();
    expect(screen.getByText(/Historical hindcast validation reflects only the years/i)).toBeInTheDocument();
  });

  it('renders out-of-sample backtesting metrics table with single-class null safety', () => {
    render(
      <HindcastSummaryPanel
        status={mockStatus}
        gate={mockGate}
        folds={mockFolds}
        results={mockResults}
        stability={mockStability}
        drift={mockDrift}
        coverage={mockCoverage}
        selectedTarget="HEAVY_RAIN"
        selectedHorizon={7}
      />
    );

    expect(screen.getByText('XGBoost Gradient Boosted Trees')).toBeInTheDocument();
    expect(screen.getByText('0.1120')).toBeInTheDocument(); // Brier score
    expect(screen.getByText('+19.4%')).toBeInTheDocument(); // BSS
    const naBadges = screen.getAllByText('N/A (single class)');
    expect(naBadges.length).toBeGreaterThan(0);
  });

  it('switches to Walk-Forward Folds tab and displays fold details and leakage checks', () => {
    render(
      <HindcastSummaryPanel
        status={mockStatus}
        gate={mockGate}
        folds={mockFolds}
        results={mockResults}
        stability={mockStability}
        drift={mockDrift}
        coverage={mockCoverage}
        selectedTarget="HEAVY_RAIN"
        selectedHorizon={7}
      />
    );

    const foldsTabBtn = screen.getByRole('button', { name: /Walk-Forward Folds/i });
    fireEvent.click(foldsTabBtn);

    expect(screen.getByText('fold_diagnostic_midseason')).toBeInTheDocument();
    expect(screen.getByText(/61 \/ 30 \/ 31/i)).toBeInTheDocument();
    expect(screen.getByText('LEAKAGE ASSERTION: VERIFIED')).toBeInTheDocument();
  });

  it('switches to Season Stability tab and renders insufficiency disclosure', () => {
    render(
      <HindcastSummaryPanel
        status={mockStatus}
        gate={mockGate}
        folds={mockFolds}
        results={mockResults}
        stability={mockStability}
        drift={mockDrift}
        coverage={mockCoverage}
        selectedTarget="HEAVY_RAIN"
        selectedHorizon={7}
      />
    );

    const stabilityTabBtn = screen.getByRole('button', { name: /Season Stability/i });
    fireEvent.click(stabilityTabBtn);

    expect(screen.getByText(/Cross-Season Performance Stability/i)).toBeInTheDocument();
    expect(screen.getByText(/STATUS: INSUFFICIENT_SEASONS/i)).toBeInTheDocument();
  });

  it('switches to Feature Drift tab and renders PSI and KS metrics', () => {
    render(
      <HindcastSummaryPanel
        status={mockStatus}
        gate={mockGate}
        folds={mockFolds}
        results={mockResults}
        stability={mockStability}
        drift={mockDrift}
        coverage={mockCoverage}
        selectedTarget="HEAVY_RAIN"
        selectedHorizon={7}
      />
    );

    const driftTabBtn = screen.getByRole('button', { name: /Feature Drift/i });
    fireEvent.click(driftTabBtn);

    expect(screen.getByText('rainfall_lag1')).toBeInTheDocument();
    expect(screen.getByText('0.0420')).toBeInTheDocument(); // PSI
    expect(screen.getByText('NEGLIGIBLE')).toBeInTheDocument();
  });

  it('switches to Feature Coverage tab and displays variable completeness', () => {
    render(
      <HindcastSummaryPanel
        status={mockStatus}
        gate={mockGate}
        folds={mockFolds}
        results={mockResults}
        stability={mockStability}
        drift={mockDrift}
        coverage={mockCoverage}
        selectedTarget="HEAVY_RAIN"
        selectedHorizon={7}
      />
    );

    const coverageTabBtn = screen.getByRole('button', { name: /Feature Coverage/i });
    fireEvent.click(coverageTabBtn);

    expect(screen.getByText('IMD Station / Gridded')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('COMPLETE')).toBeInTheDocument();
  });
});
