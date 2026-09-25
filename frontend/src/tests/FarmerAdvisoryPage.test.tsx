import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FarmerAdvisoryPage } from '../pages/farmer/FarmerAdvisoryPage';
import { advisoryService } from '../services/advisoryService';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('FarmerAdvisoryPage Component (Phase 5A Agronomic Rules Foundation)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders page with DIAGNOSTIC_ONLY operational notice and Kharif 2024 dataset badge', async () => {
    render(<FarmerAdvisoryPage />);

    expect(screen.getByTestId('farmer-advisory-page')).toBeInTheDocument();
    expect(screen.getByText('Scientific Agronomic Advisories')).toBeInTheDocument();
    expect(screen.getAllByText('DIAGNOSTIC_ONLY').length).toBeGreaterThan(0);
    expect(screen.getByText(/Informational Diagnostic Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/Kharif 2024 Archive/i)).toBeInTheDocument();
  });

  it('renders crop and growth stage selector controls', async () => {
    render(<FarmerAdvisoryPage />);

    expect(screen.getByText('Crop Focus:')).toBeInTheDocument();
    expect(screen.getByText('Growth Stage:')).toBeInTheDocument();
    expect(screen.getByText('Paddy (धान - Oryza sativa)')).toBeInTheDocument();
    expect(screen.getByText('Vegetative Tillering')).toBeInTheDocument();
  });

  it('toggles the deterministic safety gate panel on button click', async () => {
    render(<FarmerAdvisoryPage />);

    const safetyButton = screen.getByText('Safety Gate Checks');
    fireEvent.click(safetyButton);

    expect(screen.getByText(/Deterministic Agronomic Safety Gate/i)).toBeInTheDocument();
    expect(screen.getByText(/Imperative Command Filter/i)).toBeInTheDocument();
    expect(screen.getByText('Hide Safety Gate')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Hide Safety Gate'));
    expect(screen.queryByText(/Deterministic Agronomic Safety Gate/i)).not.toBeInTheDocument();
  });

  it('allows expanding and viewing scientific evidence details', async () => {
    render(<FarmerAdvisoryPage />);

    const inspectButtons = screen.getAllByText(/Inspect Scientific Evidence/i);
    expect(inspectButtons.length).toBeGreaterThan(0);

    fireEvent.click(inspectButtons[0]);
    expect(screen.getByText(/Scientific Basis & Methodology/i)).toBeInTheDocument();
    expect(screen.getByText(/Model Evidence Signals/i)).toBeInTheDocument();
    expect(screen.getByText(/Uncertainty & Multi-Season Disclaimers/i)).toBeInTheDocument();
  });
});
