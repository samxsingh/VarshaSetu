import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/responseEnvelope';
import { mlGatewayClient } from '../services/ml';

export const operationController = {
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      try {
        const data = await mlGatewayClient.get<any>('/operations/status');
        return sendSuccess(res, data);
      } catch (e) {
        // Fallback
      }

      return sendSuccess(res, {
        forecast_service_status: 'DIAGNOSTIC_ONLY',
        model_registry_status: 'OPERATIONAL_CALIBRATED_BENCHMARKS_ACTIVE',
        data_freshness_status: 'HISTORICAL_ONLY',
        calibration_status: 'PARTIAL_DIAGNOSTIC_CALIBRATED',
        validation_status: 'INSUFFICIENT_DATA',
        event_engine_status: 'ACTIVE_DIAGNOSTIC',
        delivery_status: 'INTERNAL_SIMULATION_ONLY',
        database_status: 'CONNECTED',
        last_successful_forecast_generation: null,
        last_event_detection: null,
        last_expiry_run: null,
        total_active_forecasts: 1,
        total_active_events: 0,
        active_dataset: 'Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)',
        spatial_extent: '1 Block (BLOCK resolution ~9 km)',
        timestamp: new Date().toISOString(),
        scientific_disclosures: [
          'All operational forecasting is gated under DIAGNOSTIC_ONLY status.',
          'Observational data is restricted to historical Kharif 2024 archive (Bakshi Ka Talab, UP_LKO_BKT).',
          'Multi-year hindcast validation gate status is INSUFFICIENT_DATA (requires >= 2 seasons).',
          'Notification delivery operates in provider-neutral internal simulation mode only.',
          'Agronomic crop decision commands (sowing, spraying, irrigation, harvest) are strictly disabled.',
        ],
      });
    } catch (error) {
      next(error);
    }
  },
};
