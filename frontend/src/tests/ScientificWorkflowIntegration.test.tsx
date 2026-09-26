import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { AlertCenterPage } from '../pages/analyst/AlertCenterPage';
import { DataHealthPage } from '../pages/analyst/DataHealthPage';
import { FarmerForecastPage } from '../pages/farmer/FarmerForecastPage';
import { eventService } from '../services/eventService';
import { dataHealthService } from '../services/dataHealthService';
import { forecastService } from '../services/forecastService';
import { useFarmerStore } from '../stores/useFarmerStore';
import { useOfficerStore } from '../stores/useOfficerStore';

describe('Scientific Workflow Integration & Cross-Role State Consistency (Phase 8)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Workflow 1: Horizon Selection & State Synchronization', () => {
    it('synchronizes farmer store horizon updates', () => {
      const { setHorizon } = useFarmerStore.getState();
      expect(useFarmerStore.getState().horizon).toBe(7);

      setHorizon(14);
      expect(useFarmerStore.getState().horizon).toBe(14);

      setHorizon(21);
      expect(useFarmerStore.getState().horizon).toBe(21);

      setHorizon(30);
      expect(useFarmerStore.getState().horizon).toBe(30);

      // Reset back to 7
      setHorizon(7);
      expect(useFarmerStore.getState().horizon).toBe(7);
    });

    it('synchronizes officer store horizon updates', () => {
      const { setSelectedHorizon } = useOfficerStore.getState();
      expect(useOfficerStore.getState().selectedHorizon).toBe(7);

      setSelectedHorizon(14);
      expect(useOfficerStore.getState().selectedHorizon).toBe(14);

      setSelectedHorizon(21);
      expect(useOfficerStore.getState().selectedHorizon).toBe(21);

      setSelectedHorizon(30);
      expect(useOfficerStore.getState().selectedHorizon).toBe(30);

      // Reset back to 7
      setSelectedHorizon(7);
      expect(useOfficerStore.getState().selectedHorizon).toBe(7);
    });
  });

  describe('Workflow 2: Error States & Interactive Retry Recovery', () => {
    it('renders error state and invokes retry handler in AlertCenterPage', async () => {
      const listSpy = vi.spyOn(eventService, 'listEvents')
        .mockRejectedValueOnce(new Error('Network connectivity lost to event stream'))
        .mockResolvedValueOnce({
          success: true,
          data: {
            total_events: 1,
            events: [
              {
                event_id: 'EVT_001',
                block_id: 'UP_LKO_BKT',
                event_type: 'HEAVY_RAIN_RISK',
                severity: 'WARNING',
                state: 'DETECTED',
                probability: 0.65,
                forecast_id: 'FCST_001',
                detected_at: '2024-09-15T06:00:00Z',
                threshold: 64.5,
                unit: 'mm',
                confidence_status: 'MODERATE_CONFIDENCE',
                operational_status: 'DIAGNOSTIC_ONLY',
                data_freshness: 'HISTORICAL_ONLY',
                validation_status: 'SINGLE_STATION_VALIDATED',
                deduplication_hash: 'hash_001',
                updated_at: '2024-09-15T06:00:00Z',
                description: 'Precipitation exceeding 64.5 mm threshold detected',
                valid_from: '2024-09-15',
                valid_until: '2024-09-22',
              },
            ],
          },
        });

      render(
        <MemoryRouter>
          <AlertCenterPage />
        </MemoryRouter>
      );

      // Wait for error banner
      await waitFor(() => {
        expect(screen.getByText('Network connectivity lost to event stream')).toBeInTheDocument();
      });

      const retryBtn = screen.getByRole('button', { name: /RETRY/i });
      expect(retryBtn).toBeInTheDocument();

      // Click retry
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(listSpy).toHaveBeenCalledTimes(2);
        expect(screen.getByText('HEAVY_RAIN_RISK')).toBeInTheDocument();
      });
    });

    it('renders error state and invokes retry in DataHealthPage', async () => {
      const getOverviewSpy = vi.spyOn(dataHealthService, 'getOverview')
        .mockRejectedValueOnce(new Error('Telemetry ingestion pipeline unreachable'))
        .mockResolvedValueOnce({
          success: true,
          data: {
            overallHealth: 'HEALTHY',
            totalSources: 5,
            freshSources: 5,
            totalRuns: 120,
            successfulRuns: 118,
            failedRuns: 2,
          } as any,
        });

      vi.spyOn(dataHealthService, 'getSources').mockResolvedValue({ success: true, data: [] });
      vi.spyOn(dataHealthService, 'getRuns').mockResolvedValue({
        success: true,
        data: { runs: [], pagination: { total: 0, limit: 15, offset: 0, has_more: false } },
      });

      render(
        <MemoryRouter>
          <DataHealthPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Telemetry ingestion pipeline unreachable')).toBeInTheDocument();
      });

      const retryBtn = screen.getByRole('button', { name: /RETRY/i });
      expect(retryBtn).toBeInTheDocument();

      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(getOverviewSpy).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Workflow 3: Empty State Handling for Zero Results', () => {
    it('renders descriptive empty state when no events match filter', async () => {
      vi.spyOn(eventService, 'listEvents').mockResolvedValue({
        success: true,
        data: {
          total_events: 0,
          events: [],
        },
      });

      render(
        <MemoryRouter>
          <AlertCenterPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No active events matching filter criteria')).toBeInTheDocument();
        expect(screen.getByText(/Click "Detect Events" above to run a threshold evaluation pass/i)).toBeInTheDocument();
      });
    });

    it('renders honest scientific message when forecast window has no active data', async () => {
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
      vi.spyOn(eventService, 'getEvents').mockResolvedValue({
        success: true,
        data: { total_events: 0, events: [] },
      });

      render(
        <MemoryRouter>
          <FarmerForecastPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('NO OBSERVATIONS FOR SELECTED WINDOW')).toBeInTheDocument();
        expect(screen.getByText(/The historical Kharif 2024 archive currently does not have active risk forecasts/i)).toBeInTheDocument();
      });
    });
  });

  describe('Workflow 4: Role-Based Navigation & Active State Recognition', () => {
    it('identifies Farmer portal subroutes as active in the global Navbar', () => {
      render(
        <MemoryRouter initialEntries={['/farmer/forecast']}>
          <Navbar />
        </MemoryRouter>
      );

      const farmerLink = screen.getByRole('link', { name: /Farmer Portal/i });
      expect(farmerLink).toHaveClass('bg-[#0E7490]');
      expect(farmerLink).toHaveClass('text-white');
    });

    it('identifies Officer portal subroutes as active in the global Navbar', () => {
      render(
        <MemoryRouter initialEntries={['/officer/map']}>
          <Navbar />
        </MemoryRouter>
      );

      const officerLink = screen.getByRole('link', { name: /Officer Center/i });
      expect(officerLink).toHaveClass('bg-[#0E7490]');
      expect(officerLink).toHaveClass('text-white');
    });

    it('identifies Government portal subroutes as active in the global Navbar', () => {
      render(
        <MemoryRouter initialEntries={['/government/command-center']}>
          <Navbar />
        </MemoryRouter>
      );

      const govLink = screen.getByRole('link', { name: /Government/i });
      expect(govLink).toHaveClass('bg-[#0E7490]');
      expect(govLink).toHaveClass('text-white');
    });

    it('identifies Analyst lab subroutes as active in the global Navbar', () => {
      render(
        <MemoryRouter initialEntries={['/analyst/forecast-lab']}>
          <Navbar />
        </MemoryRouter>
      );

      const analystLink = screen.getByRole('link', { name: /Analyst Lab/i });
      expect(analystLink).toHaveClass('bg-[#0E7490]');
      expect(analystLink).toHaveClass('text-white');
    });
  });
});
