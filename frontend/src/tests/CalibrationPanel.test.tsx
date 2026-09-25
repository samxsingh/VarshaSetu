import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalibrationReliabilityPanel } from '../components/analyst/CalibrationReliabilityPanel';

describe('CalibrationReliabilityPanel Component (Phase 4C Scientific Reliability)', () => {
  const mockStatus = {
    service: 'varshasetu-calibration-engine',
    phase: 'PHASE_4C_CALIBRATION_RELIABILITY_STAGE',
    calibration_status: 'INSUFFICIENT_DATA',
    operational_calibration_active: false,
    active_calibrator_type: 'NONE',
    gate_status: 'INSUFFICIENT_DATA',
    diagnostics_available: true,
    reason: 'Current dataset has 122 observations (Kharif 2024 single-season).',
  };

  const mockReliability = {
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
        {
          bin_index: 0,
          bin_lower: 0.0,
          bin_upper: 0.1,
          mean_predicted_probability: 0.05,
          observed_frequency: 0.0,
          sample_count: 12,
          is_empty: false,
        },
        {
          bin_index: 1,
          bin_lower: 0.1,
          bin_upper: 0.2,
          mean_predicted_probability: 0.15,
          observed_frequency: 0.2,
          sample_count: 6,
          is_empty: false,
        },
        {
          bin_index: 2,
          bin_lower: 0.2,
          bin_upper: 0.3,
          mean_predicted_probability: null,
          observed_frequency: null,
          sample_count: 0,
          is_empty: true,
        },
      ],
    },
  };

  const mockComparison = {
    target_name: 'HEAVY_RAIN',
    horizon_days: 7,
    gate_status: 'INSUFFICIENT_DATA',
    comparison: [
      {
        model_id: 'xgboost',
        model_name: 'XGBoost Gradient Boosted Trees',
        raw_brier_score: 0.112,
        raw_ece: 0.082,
        raw_brier_skill_score: 0.1937,
        calibrated_platt_brier_score: null,
        calibrated_isotonic_brier_score: null,
        best_calibrator: 'NONE',
        operational_status: 'DIAGNOSTIC_ONLY',
        note: 'Validation sample size insufficient for post-hoc calibration.',
      },
    ],
  };

  it('renders operational calibration status and scientific data gate status', () => {
    render(
      <CalibrationReliabilityPanel
        status={mockStatus}
        comparison={mockComparison}
        reliability={mockReliability}
        selectedTarget="HEAVY_RAIN"
        selectedHorizon={7}
      />
    );

    expect(
      screen.getByText(/Probability Reliability & Calibration Diagnostics/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Operational Calibration Inactive/i)).toBeInTheDocument();
    expect(screen.getByText(/GATE STATUS: INSUFFICIENT_DATA/i)).toBeInTheDocument();
    expect(screen.getByText(/Current dataset has 122 observations/i)).toBeInTheDocument();
  });

  it('renders reliability metrics, Murphy Brier decomposition, and SVG diagram', () => {
    const { container } = render(
      <CalibrationReliabilityPanel
        status={mockStatus}
        comparison={mockComparison}
        reliability={mockReliability}
        selectedTarget="HEAVY_RAIN"
        selectedHorizon={7}
      />
    );

    // Reliability metrics
    expect(screen.getAllByText('0.1120').length).toBeGreaterThanOrEqual(1); // Brier score
    expect(screen.getByText('+19.4%')).toBeInTheDocument(); // BSS
    expect(screen.getAllByText('0.0820').length).toBeGreaterThanOrEqual(1); // ECE
    expect(screen.getByText('0.1450')).toBeInTheDocument(); // MCE

    // Murphy decomposition
    expect(screen.getByText(/Murphy \(1973\) Brier Score Decomposition/i)).toBeInTheDocument();
    expect(screen.getByText('0.0210')).toBeInTheDocument(); // Reliability (REL)
    expect(screen.getByText('0.0450')).toBeInTheDocument(); // Resolution (RES)
    expect(screen.getByText('0.1360')).toBeInTheDocument(); // Uncertainty (UNC)

    // SVG reliability diagram
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(container.querySelector('line[stroke-dasharray="4,4"]')).toBeInTheDocument(); // Perfect reliability diagonal
  });

  it('renders raw vs calibrated comparison table with honest status disclosures', () => {
    render(
      <CalibrationReliabilityPanel
        status={mockStatus}
        comparison={mockComparison}
        reliability={mockReliability}
        selectedTarget="HEAVY_RAIN"
        selectedHorizon={7}
      />
    );

    expect(screen.getByText(/Raw vs Calibrated Model Benchmark/i)).toBeInTheDocument();
    expect(screen.getByText('XGBoost Gradient Boosted Trees')).toBeInTheDocument();
    expect(screen.getByText(/DIAGNOSTIC_ONLY/i)).toBeInTheDocument();
    expect(screen.getByText(/Validation sample size insufficient for post-hoc calibration/i)).toBeInTheDocument();
  });
});
