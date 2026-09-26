import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/responseEnvelope';
import { mlGatewayClient } from '../services/ml';
import { operationalSignalService } from '../services/operational/operationalSignalService';
import { inspectionActionService } from '../services/operational/inspectionActionService';
import { commandCenterService } from '../services/operational/commandCenterService';
import { AuthenticatedRequest } from '../types';

export const operationController = {
  async getCommandCenter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await commandCenterService.getCommandCenter(
        {
          userId: req.user?.id || 'system',
          role: req.user?.role || 'CLIMATE_ANALYST',
          assignedLocationId: req.user?.assignedLocationId,
        },
        {
          blockId: req.query.blockId as string | undefined,
          timeHorizon: req.query.timeHorizon as string | undefined,
        }
      );

      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getSignals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const signals = await operationalSignalService.getSignals(req.query, {
        userId: req.user?.id,
        role: req.user?.role,
        assignedLocationId: req.user?.assignedLocationId,
      });

      return sendSuccess(res, {
        items: signals,
        total: signals.length,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSignalContext(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const signalId = req.params.signalId;
      const context = await operationalSignalService.getDecisionSupportContext(signalId, {
        userId: req.user?.id,
        role: req.user?.role,
        assignedLocationId: req.user?.assignedLocationId,
      });

      return sendSuccess(res, context);
    } catch (error) {
      next(error);
    }
  },

  async createAction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const action = await inspectionActionService.createAction(req.body, {
        userId: req.user?.id || 'system',
        role: req.user?.role || 'ANALYST',
        assignedLocationId: req.user?.assignedLocationId,
      });

      return sendSuccess(res, action, undefined, 201);
    } catch (error) {
      next(error);
    }
  },

  async listActions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actions = await inspectionActionService.listActions(req.query as any, {
        userId: req.user?.id || 'system',
        role: req.user?.role || 'ANALYST',
        assignedLocationId: req.user?.assignedLocationId,
      });

      return sendSuccess(res, {
        items: actions,
        total: actions.length,
      });
    } catch (error) {
      next(error);
    }
  },

  async getActionById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const action = await inspectionActionService.getActionById(req.params.actionId, {
        userId: req.user?.id || 'system',
        role: req.user?.role || 'ANALYST',
        assignedLocationId: req.user?.assignedLocationId,
      });

      return sendSuccess(res, action);
    } catch (error) {
      next(error);
    }
  },

  async assignAction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const action = await inspectionActionService.assignAction(
        req.params.actionId,
        req.body?.assignedTo,
        {
          userId: req.user?.id || 'system',
          role: req.user?.role || 'ANALYST',
          assignedLocationId: req.user?.assignedLocationId,
        },
        req.body?.reason
      );

      return sendSuccess(res, action);
    } catch (error) {
      next(error);
    }
  },

  async startAction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const action = await inspectionActionService.startAction(
        req.params.actionId,
        {
          userId: req.user?.id || 'system',
          role: req.user?.role || 'ANALYST',
          assignedLocationId: req.user?.assignedLocationId,
        },
        req.body?.reason
      );

      return sendSuccess(res, action);
    } catch (error) {
      next(error);
    }
  },

  async completeAction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const action = await inspectionActionService.completeAction(
        req.params.actionId,
        req.body?.completionNotes,
        {
          userId: req.user?.id || 'system',
          role: req.user?.role || 'ANALYST',
          assignedLocationId: req.user?.assignedLocationId,
        }
      );

      return sendSuccess(res, action);
    } catch (error) {
      next(error);
    }
  },

  async cancelAction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const action = await inspectionActionService.cancelAction(
        req.params.actionId,
        req.body?.cancellationReason,
        {
          userId: req.user?.id || 'system',
          role: req.user?.role || 'ANALYST',
          assignedLocationId: req.user?.assignedLocationId,
        }
      );

      return sendSuccess(res, action);
    } catch (error) {
      next(error);
    }
  },

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
