import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OfficerForecastPage } from '../pages/officer/OfficerForecastPage';
import { forecastService } from '../services/forecastService';

describe('OfficerForecastPage Component (Phase 4E Scientific Comparison Matrix)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(forecastService, 'getForecasts').mockResolvedValue({
      success: true,
      data: {
        total_forecasts: 0,
        forecasts: [],
      },
      meta: {
        timestamp: new Date().toISOString(),
        dataMode: 'REAL',
      },
    });
  });

  it('renders header with diagnostic and neutral comparison badges', () => {
    render(<OfficerForecastPage />);

    expect(screen.getByText('Block-Level Forecast Comparison Matrix')).toBeInTheDocument();
    expect(screen.getByText(/Diagnostic Only \(Kharif 2024\)/i)).toBeInTheDocument();
    expect(screen.getByText('Neutral Comparison')).toBeInTheDocument();
  });

  it('displays observational anchor disclosure for Bakshi Ka Talab without block ranking', () => {
    render(<OfficerForecastPage />);

    expect(screen.getByText(/Observational Anchor Disclosure:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Bakshi Ka Talab \(UP_LKO_BKT\) currently contains the assimilated Kharif 2024/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/blocks are not ranked as "best" or "worst"/i)
    ).toBeInTheDocument();

    // Verify no subjective ranking badges exist
    expect(screen.queryByText(/best block/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/worst block/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/rank 1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/top performing/i)).not.toBeInTheDocument();
  });

  it('renders district blocks with neutral status indicators and ground anchor tagging', () => {
    render(<OfficerForecastPage />);

    // Bakshi Ka Talab has GROUND ANCHOR badge
    expect(screen.getByText('Bakshi Ka Talab')).toBeInTheDocument();
    expect(screen.getByText('UP_LKO_BKT')).toBeInTheDocument();
    expect(screen.getByText('GROUND ANCHOR')).toBeInTheDocument();

    // Other blocks have INTERPOLATED badge
    expect(screen.getByText('Malihabad')).toBeInTheDocument();
    expect(screen.getByText('Mohanlalganj')).toBeInTheDocument();
    expect(screen.getByText('Chinhat')).toBeInTheDocument();
    const interpolatedBadges = screen.getAllByText('INTERPOLATED');
    expect(interpolatedBadges.length).toBeGreaterThanOrEqual(4);
  });

  it('allows switching forecast horizon cleanly', async () => {
    render(<OfficerForecastPage />);

    // Check default is 7D or HorizonSelector exists
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(0);

    // Switch to another horizon button (e.g. 14 Days)
    const tab14d = screen.getByText('14 Days');
    fireEvent.click(tab14d);
    await waitFor(() => {
      expect(forecastService.getForecasts).toHaveBeenCalled();
    });
  });
});
