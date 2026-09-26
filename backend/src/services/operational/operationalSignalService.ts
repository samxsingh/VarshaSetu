import { Event, IEvent } from '../../models/Event';
import { Forecast, IForecast } from '../../models/Forecast';
import { Advisory, IAdvisory } from '../../models/Advisory';
import { DataHealth, IDataHealth } from '../../models/DataHealth';
import {
  OperationalSignalDTO,
  GetSignalsQuery,
  OperationalSignalContext,
  OperationalSignalType,
  SignalSeverity,
} from './operationalSignalTypes';
import { ForbiddenError, ValidationError } from '../../utils/errors';
import { isDatabaseConnected } from '../../config/database';

const SEVERITY_WEIGHT: Record<SignalSeverity, number> = {
  CRITICAL: 4,
  WARNING: 3,
  WATCH: 2,
  INFO: 1,
};

export const operationalSignalService = {
  /**
   * Transforms an authoritative Event into an OperationalSignalDTO
   */
  fromEvent(event: IEvent | any): OperationalSignalDTO {
    const id = event.eventId || (event._id ? event._id.toString() : 'unknown');
    return {
      signalId: `sig_evt_${id}`,
      signalType: 'EVENT',
      title: `${event.severity}: ${event.eventType.replace(/_/g, ' ')}`,
      summary: event.description,
      severity: event.severity,
      blockId: event.blockId || 'UP_LKO_BKT',
      detectedAt: event.detectedAt ? new Date(event.detectedAt).toISOString() : new Date().toISOString(),
      validFrom: event.validFrom ? new Date(event.validFrom).toISOString() : new Date().toISOString(),
      validUntil: event.validUntil
        ? new Date(event.validUntil).toISOString()
        : new Date(Date.now() + 7 * 86400000).toISOString(),
      probability: typeof event.probability === 'number' ? event.probability : null,
      confidenceStatus: event.confidenceStatus || 'NOT CONFIGURED',
      operationalStatus: event.operationalStatus || 'DIAGNOSTIC_ONLY',
      dataFreshness: event.dataFreshness || 'HISTORICAL_ONLY',
      validationStatus: event.validationStatus || 'VALIDATED',
      sourceReferences: [
        { id: id, type: 'EVENT', label: `Event ${event.eventType}` },
        ...(event.forecastId ? [{ id: event.forecastId, type: 'FORECAST', label: 'Driving Forecast' }] : []),
      ],
      recommendedInspection:
        'Inspect field observation logs, confirm AWS station rain gauge accumulation, and review extension bulletin recommendations.',
      createdAt: event.createdAt ? new Date(event.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: event.updatedAt ? new Date(event.updatedAt).toISOString() : new Date().toISOString(),
      metadata: {
        threshold: event.threshold,
        unit: event.unit,
        state: event.state,
      },
    };
  },

  /**
   * Transforms an authoritative Forecast into an OperationalSignalDTO
   */
  fromForecast(forecast: IForecast | any): OperationalSignalDTO {
    const id = forecast.forecastId || (forecast._id ? forecast._id.toString() : 'unknown');
    const prob = typeof forecast.probability === 'number' ? forecast.probability : null;
    let severity: SignalSeverity = 'INFO';
    if (prob !== null) {
      if (prob >= 0.7) severity = 'WARNING';
      else if (prob >= 0.4) severity = 'WATCH';
    }

    return {
      signalId: `sig_fc_${id}`,
      signalType: 'FORECAST_CHANGE',
      title: `${forecast.targetType.replace(/_/g, ' ')} Outlook (${forecast.horizonDays}D)`,
      summary: `Probabilistic risk projection of ${prob !== null ? `${Math.round(prob * 100)}%` : 'NOT AVAILABLE'} over the ${forecast.horizonDays}-day meteorological window.`,
      severity,
      blockId: forecast.blockCode || 'UP_LKO_BKT',
      detectedAt: forecast.createdAt ? new Date(forecast.createdAt).toISOString() : new Date().toISOString(),
      validFrom: forecast.validFrom ? new Date(forecast.validFrom).toISOString() : new Date().toISOString(),
      validUntil: forecast.validUntil
        ? new Date(forecast.validUntil).toISOString()
        : new Date(Date.now() + (forecast.horizonDays || 7) * 86400000).toISOString(),
      probability: prob,
      confidenceStatus: forecast.confidenceTier || 'NOT CONFIGURED',
      operationalStatus: forecast.operationalStatus || 'DIAGNOSTIC_ONLY',
      dataFreshness: forecast.dataFreshness || 'ARCHIVED',
      validationStatus: forecast.validationStatus || 'VALIDATED',
      sourceReferences: [{ id: id, type: 'FORECAST', label: `${forecast.targetType} ${forecast.horizonDays}D` }],
      recommendedInspection:
        'Review downscaled probability distributions and uncertainty intervals (P10-P90) in the Forecast Lab.',
      createdAt: forecast.createdAt ? new Date(forecast.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: forecast.updatedAt ? new Date(forecast.updatedAt).toISOString() : new Date().toISOString(),
      metadata: {
        horizonDays: forecast.horizonDays,
        targetType: forecast.targetType,
        uncertainty: forecast.uncertainty,
      },
    };
  },

  /**
   * Transforms an authoritative Advisory into an OperationalSignalDTO
   */
  fromAdvisory(advisory: IAdvisory | any): OperationalSignalDTO {
    const id = advisory.advisoryId || (advisory._id ? advisory._id.toString() : 'unknown');
    return {
      signalId: `sig_adv_${id}`,
      signalType: 'ADVISORY',
      title: `${advisory.cropType} (${advisory.growthStage}): ${advisory.severity} Advisory`,
      summary: advisory.actionRecommendation || advisory.scientificRationale || 'Active agronomic recommendation',
      severity: advisory.severity || 'INFO',
      blockId: advisory.blockId || 'UP_LKO_BKT',
      detectedAt: advisory.createdAt ? new Date(advisory.createdAt).toISOString() : new Date().toISOString(),
      validFrom: advisory.createdAt ? new Date(advisory.createdAt).toISOString() : new Date().toISOString(),
      validUntil: new Date(
        (advisory.createdAt ? new Date(advisory.createdAt).getTime() : Date.now()) + 7 * 86400000
      ).toISOString(),
      probability: null,
      confidenceStatus: advisory.safetyGatePassed ? 'PASS' : 'MARGINAL',
      operationalStatus: 'DIAGNOSTIC_ONLY',
      dataFreshness: 'FRESH',
      validationStatus: 'VALIDATED',
      sourceReferences: [
        { id: id, type: 'ADVISORY', label: `Crop Advisory (${advisory.cropType})` },
        ...(advisory.forecastId ? [{ id: advisory.forecastId, type: 'FORECAST', label: 'Driving Forecast' }] : []),
      ],
      recommendedInspection:
        'Inspect crop phenology growth stage thresholds and verify field drainage or irrigation guidelines.',
      createdAt: advisory.createdAt ? new Date(advisory.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: advisory.updatedAt ? new Date(advisory.updatedAt).toISOString() : new Date().toISOString(),
      metadata: {
        cropType: advisory.cropType,
        growthStage: advisory.growthStage,
        riskCategory: advisory.riskCategory,
      },
    };
  },

  /**
   * Transforms an authoritative DataHealth record into an OperationalSignalDTO
   */
  fromDataHealth(dh: IDataHealth | any): OperationalSignalDTO {
    const id = dh.sourceId || (dh._id ? dh._id.toString() : 'unknown');
    const isDegraded = dh.status === 'DEGRADED';
    return {
      signalId: `sig_dq_${id}`,
      signalType: 'DATA_QUALITY',
      title: `Data Quality Alert: ${dh.name || 'Meteorological Pipeline'}`,
      summary: `Data source ${dh.provider || 'IMD/ECMWF'} (${dh.name}) status is ${dh.status}. Ingestion update frequency is ${dh.updateFrequency}.`,
      severity: isDegraded ? 'WARNING' : 'INFO',
      blockId: 'UP_LKO_BKT',
      detectedAt: dh.updatedAt ? new Date(dh.updatedAt).toISOString() : new Date().toISOString(),
      validFrom: dh.updatedAt ? new Date(dh.updatedAt).toISOString() : new Date().toISOString(),
      validUntil: new Date(
        (dh.updatedAt ? new Date(dh.updatedAt).getTime() : Date.now()) + 24 * 3600000
      ).toISOString(),
      probability: null,
      confidenceStatus: 'NOT CONFIGURED',
      operationalStatus: 'DIAGNOSTIC_ONLY',
      dataFreshness: 'HISTORICAL_ONLY',
      validationStatus: 'PROVISIONAL',
      sourceReferences: [{ id: id, type: 'DATA_HEALTH', label: `Source ${dh.name}` }],
      recommendedInspection:
        'Inspect telemetry ingestion logs and sensor synchronization records in the Data Health Observatory.',
      createdAt: dh.createdAt ? new Date(dh.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: dh.updatedAt ? new Date(dh.updatedAt).toISOString() : new Date().toISOString(),
      metadata: {
        provider: dh.provider,
        status: dh.status,
      },
    };
  },

  /**
   * Returns authoritative system operational gate signals
   */
  getSystemGateSignals(): OperationalSignalDTO[] {
    return [
      {
        signalId: 'sig_gate_multiyear_hindcast_insufficient',
        signalType: 'OPERATIONAL_GATE',
        title: 'Operational Gate: Single-Season Baseline Enforced',
        summary:
          'Platform is strictly gated under DIAGNOSTIC_ONLY status. Observational anchor is Lucknow (UP_LKO_BKT, Kharif 2024 archive). Multi-year hindcast validation status is INSUFFICIENT_DATA.',
        severity: 'WATCH',
        blockId: 'UP_LKO_BKT',
        detectedAt: '2024-07-01T00:00:00.000Z',
        validFrom: '2024-07-01T00:00:00.000Z',
        validUntil: '2024-10-31T23:59:59.000Z',
        probability: null,
        confidenceStatus: 'PASS',
        operationalStatus: 'DIAGNOSTIC_ONLY',
        dataFreshness: 'ARCHIVED',
        validationStatus: 'INSUFFICIENT_DATA',
        sourceReferences: [{ id: 'GATE_MULTIYEAR_2024', type: 'OPERATIONAL_GATE', label: 'Kharif 2024 Gate' }],
        recommendedInspection:
          'Review multi-year hindcast cross-validation folds and empirical reliability gate status before operational release.',
        createdAt: '2024-07-01T00:00:00.000Z',
        updatedAt: '2024-07-01T00:00:00.000Z',
      },
      {
        signalId: 'sig_model_calib_ensemble',
        signalType: 'MODEL_STATUS',
        title: 'Model Registry: Tree Ensemble Calibrated Benchmarks Active',
        summary:
          'Gradient boosted trees (XGBoost, LightGBM) calibrated with Platt Scaling and Isotonic Regression against Kharif 2024 holdout dataset.',
        severity: 'INFO',
        blockId: 'UP_LKO_BKT',
        detectedAt: '2024-07-15T00:00:00.000Z',
        validFrom: '2024-07-15T00:00:00.000Z',
        validUntil: '2024-10-31T23:59:59.000Z',
        probability: null,
        confidenceStatus: 'PASS',
        operationalStatus: 'DIAGNOSTIC_ONLY',
        dataFreshness: 'FRESH',
        validationStatus: 'VALIDATED',
        sourceReferences: [{ id: 'REGISTRY_TREE_MODELS', type: 'MODEL', label: 'Tree Model Ensembles' }],
        recommendedInspection:
          'Inspect Brier Skill Scores, ECE reliability curves, and TreeSHAP feature attributions in the Forecast Lab.',
        createdAt: '2024-07-15T00:00:00.000Z',
        updatedAt: '2024-07-15T00:00:00.000Z',
      },
    ];
  },

  /**
   * Retrieves all authorized operational signals with deterministic filtering, RBAC, and deduplication
   */
  async getSignals(
    query: GetSignalsQuery,
    context: OperationalSignalContext
  ): Promise<OperationalSignalDTO[]> {
    const { role, assignedLocationId } = context;

    // RBAC & Geography Security Guards
    let targetBlock: string | undefined = query.blockId;

    if (role === 'FARMER') {
      const allowedBlock = assignedLocationId || 'UP_LKO_BKT';
      if (query.blockId && query.blockId !== allowedBlock) {
        throw new ForbiddenError('Farmers are strictly restricted to their assigned operational block');
      }
      targetBlock = allowedBlock;
    } else if (role === 'OFFICER') {
      const allowedBlock = assignedLocationId || 'UP_LKO_BKT';
      if (query.blockId && query.blockId !== allowedBlock) {
        throw new ForbiddenError('Field Officers are restricted to their assigned administrative block');
      }
      targetBlock = query.blockId || allowedBlock;
    }

    const signalMap = new Map<string, OperationalSignalDTO>();

    // 1. Fetch Events
    if (isDatabaseConnected()) {
      try {
        const eventQuery: any = { state: { $nin: ['RESOLVED', 'EXPIRED'] } };
        if (targetBlock) eventQuery.blockId = targetBlock;
        if (query.severity) eventQuery.severity = query.severity;

        const events = await Event.find(eventQuery).sort({ detectedAt: -1 }).limit(30).lean();
        events.forEach((evt) => {
          const sig = operationalSignalService.fromEvent(evt);
          signalMap.set(sig.signalId, sig);
        });
      } catch (err) {
        // Fallback gracefully
      }

      // 2. Fetch Forecasts
      try {
        const fcQuery: any = {};
        if (targetBlock) fcQuery.blockCode = targetBlock;

        const forecasts = await Forecast.find(fcQuery).sort({ createdAt: -1 }).limit(20).lean();
        forecasts.forEach((fc) => {
          const sig = operationalSignalService.fromForecast(fc);
          signalMap.set(sig.signalId, sig);
        });
      } catch (err) {
        // Fallback gracefully
      }

      // 3. Fetch Advisories
      try {
        const advQuery: any = { status: 'ACTIVE' };
        if (targetBlock) advQuery.blockId = targetBlock;
        if (query.severity) advQuery.severity = query.severity;

        const advisories = await Advisory.find(advQuery).sort({ createdAt: -1 }).limit(20).lean();
        advisories.forEach((adv) => {
          const sig = operationalSignalService.fromAdvisory(adv);
          signalMap.set(sig.signalId, sig);
        });
      } catch (err) {
        // Fallback gracefully
      }

      // 4. Fetch DataHealth (only for non-farmer personas)
      if (role !== 'FARMER') {
        try {
          const dataHealthRecords = await DataHealth.find().sort({ updatedAt: -1 }).limit(5).lean();
          dataHealthRecords.forEach((dh) => {
            const sig = operationalSignalService.fromDataHealth(dh);
            signalMap.set(sig.signalId, sig);
          });
        } catch (err) {
          // Fallback gracefully
        }
      }
    }

    // 5. Add System Gate Signals
    const gateSignals = operationalSignalService.getSystemGateSignals();
    gateSignals.forEach((sig) => {
      // Filter out internal model status for farmers
      if (role === 'FARMER' && sig.signalType === 'MODEL_STATUS') {
        return;
      }
      if (!targetBlock || sig.blockId === targetBlock) {
        signalMap.set(sig.signalId, sig);
      }
    });

    let signals = Array.from(signalMap.values());

    // Filter by query parameters
    if (query.signalType) {
      signals = signals.filter((s) => s.signalType === query.signalType);
    }
    if (query.severity) {
      signals = signals.filter((s) => s.severity === query.severity);
    }
    if (query.operationalStatus) {
      signals = signals.filter((s) => s.operationalStatus === query.operationalStatus);
    }
    if (targetBlock) {
      signals = signals.filter((s) => s.blockId === targetBlock);
    }

    // Sort by severity (descending) then detectedAt (descending)
    signals.sort((a, b) => {
      const weightA = SEVERITY_WEIGHT[a.severity] || 0;
      const weightB = SEVERITY_WEIGHT[b.severity] || 0;
      if (weightB !== weightA) {
        return weightB - weightA;
      }
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
    });

    // Pagination limit
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 50;
    return signals.slice(0, limit);
  },
};
