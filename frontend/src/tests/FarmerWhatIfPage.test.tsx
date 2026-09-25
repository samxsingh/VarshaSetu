import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FarmerWhatIfPage } from '../pages/farmer/FarmerWhatIfPage';
import { advisoryService } from '../services/advisoryService';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('FarmerWhatIfPage Component (Phase 5B Scenario Simulator)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders page with SCENARIO_INDICATOR_ONLY classification and yield disclaimer', async () => {
    render(<FarmerWhatIfPage />);

    expect(screen.getByTestId('farmer-whatif-page')).toBeInTheDocument();
    expect(screen.getByText('What-If Agro-Climate Scenario Simulator')).toBeInTheDocument();
    expect(screen.getAllByText('SCENARIO_INDICATOR_ONLY').length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Strict Scientific Boundary: Sensitivity Indicators Only/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/VarshaSetu does NOT predict crop yields/i)
    ).toBeInTheDocument();
  });

  it('renders the 6 controlled scenario exploration tabs', async () => {
    render(<FarmerWhatIfPage />);

    expect(screen.getByText('Sowing Date Shift')).toBeInTheDocument();
    expect(screen.getByText('Supplemental Irrigation')).toBeInTheDocument();
    expect(screen.getByText('Seasonal Rainfall Anomaly')).toBeInTheDocument();
    expect(screen.getByText('Rainfall Timing Shift')).toBeInTheDocument();
    expect(screen.getByText('Heavy Rain Concentration')).toBeInTheDocument();
    expect(screen.getByText('Compound Multi-Hazard')).toBeInTheDocument();
  });

  it('switches between scenario tabs and updates parameter controls', async () => {
    render(<FarmerWhatIfPage />);

    const irrigationTab = screen.getByText('Supplemental Irrigation');
    fireEvent.click(irrigationTab);
    expect(irrigationTab.closest('button')).toHaveClass('bg-brand-teal');

    const anomalyTab = screen.getByText('Seasonal Rainfall Anomaly');
    fireEvent.click(anomalyTab);
    expect(anomalyTab.closest('button')).toHaveClass('bg-brand-teal');
    expect(screen.getByText(/Rainfall Anomaly:/i)).toBeInTheDocument();
  });
});
