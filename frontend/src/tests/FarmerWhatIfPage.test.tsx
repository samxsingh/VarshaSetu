import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FarmerWhatIfPage } from '../pages/farmer/FarmerWhatIfPage';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('FarmerWhatIfPage Component (Phase 5A What-If Simulator Foundation)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders page with SCENARIO_INDICATOR_ONLY classification and yield disclaimer', async () => {
    render(<FarmerWhatIfPage />);

    expect(screen.getByTestId('farmer-whatif-page')).toBeInTheDocument();
    expect(screen.getByText('What-If Agro-Climate Scenario Simulator')).toBeInTheDocument();
    expect(screen.getAllByText('SCENARIO_INDICATOR_ONLY').length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Strict Scientific Boundary: Sensitivity Indicator Only/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/VarshaSetu does NOT provide crop-specific yield predictions/i)
    ).toBeInTheDocument();
  });

  it('renders sensitivity shift indices (water stress & waterlogging)', async () => {
    render(<FarmerWhatIfPage />);

    expect(screen.getByText(/Water Stress Shift Index/i)).toBeInTheDocument();
    expect(screen.getByText(/Waterlogging Risk Shift Index/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulation Assumptions & Meteorological Notes/i)).toBeInTheDocument();
  });

  it('switches between scenario types', async () => {
    render(<FarmerWhatIfPage />);

    const irrigationTab = screen.getByText('Supplemental Irrigation Scheduling');
    fireEvent.click(irrigationTab);
    expect(irrigationTab).toHaveClass('bg-brand-teal');

    const anomalyTab = screen.getByText('Seasonal Rainfall Anomaly Shock');
    fireEvent.click(anomalyTab);
    expect(anomalyTab).toHaveClass('bg-brand-teal');
    expect(screen.getByText(/Monsoon Rain Shock:/i)).toBeInTheDocument();
  });
});
