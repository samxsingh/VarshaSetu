import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DataHealthPage } from '../pages/analyst/DataHealthPage';
import { dataHealthService } from '../services/dataHealthService';

vi.mock('../services/dataHealthService', () => ({
  dataHealthService: {
    getOverview: vi.fn(),
    getSources: vi.fn(),
    getRuns: vi.fn(),
    triggerIngestion: vi.fn(),
  },
}));

describe('DataHealthPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the pipeline header and initial loading state', async () => {
    vi.mocked(dataHealthService.getOverview).mockResolvedValue({
      success: true,
      data: {
        totalSources: 5,
        activeSources: 4,
        freshSources: 4,
        staleSources: 0,
        totalRuns: 12,
        successfulRuns: 12,
        failedRuns: 0,
        lastSyncTime: '2026-09-25T14:15:16.617Z',
        overallHealth: 'HEALTHY',
      },
    });

    vi.mocked(dataHealthService.getSources).mockResolvedValue({
      success: true,
      data: [
        {
          id: 'src-1',
          name: 'NOAA CPC ENSO Niño 3.4 SST Anomaly',
          provider: 'NOAA_CPC',
          type: 'ENSO_SST',
          status: 'FRESH',
          update_frequency: 'WEEKLY',
          last_successful_sync: '2026-09-25T14:15:12.019Z',
          provenance_url: 'https://psl.noaa.gov/data/correlation/nina34.data',
        },
      ],
    });

    vi.mocked(dataHealthService.getRuns).mockResolvedValue({
      success: true,
      data: {
        runs: [
          {
            id: 'run-1',
            source_name: 'NOAA_CPC Niño 3.4 SST Anomaly',
            provider: 'NOAA_CPC',
            dataset_name: 'Niño 3.4 SST Anomaly Index',
            variable: 'ENSO_SST',
            started_at: '2026-09-25T14:15:10.000Z',
            completed_at: '2026-09-25T14:15:12.000Z',
            status: 'SUCCESS',
            records_processed: 920,
            records_failed: 0,
            quality_summary: { quality_flag: 'GOOD' },
            file_path: '/path/to/climate_enso_nino34.parquet',
          },
        ],
        pagination: { total: 1, limit: 15, offset: 0, hasMore: false },
      },
    });

    render(<DataHealthPage />);

    expect(screen.getByText(/Data Pipeline & Telemetry Health/i)).toBeInTheDocument();
    expect(screen.getByText(/Trigger Pipeline Ingestion/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('NOAA CPC ENSO Niño 3.4 SST Anomaly')).toBeInTheDocument();
      expect(screen.getByText('Niño 3.4 SST Anomaly Index')).toBeInTheDocument();
      expect(screen.getByText('920')).toBeInTheDocument();
    });
  });
});
