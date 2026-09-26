import { operationalSignalService } from './operationalSignalService';
import {
  OperationalSignalDTO,
  SignalSeverity,
  OperationalSignalType,
} from './operationalSignalTypes';
import {
  inspectionActionRepository,
  ActionFilters,
} from '../../repositories/inspectionActionRepository';
import {
  IInspectionAction,
  InspectionActionStatus,
  InspectionActionPriority,
} from '../../models/InspectionAction';
import { mlGatewayClient } from '../ml';
import { ForbiddenError, BadRequestError } from '../../utils/errors';
import { UserRole } from '@shared/types';

export interface AttentionQueueItemDTO {
  id: string;
  sourceType: 'SIGNAL' | 'ACTION';
  sourceId: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'WATCH' | 'INFO';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  reason:
    | 'UNACTIONED_CRITICAL_SIGNAL'
    | 'OVERDUE_P1_ACTION'
    | 'STALLED_IN_PROGRESS'
    | 'UNASSIGNED_HIGH_PRIORITY'
    | 'ROUTINE_MONITORING';
  blockId: string;
  status: string;
  assignedTo?: string;
  ageHours: number;
  detectedAt: string;
}

export interface AgingDistributionDTO {
  lessThan1h: number;
  between1hAnd6h: number;
  between6hAnd24h: number;
  between24hAnd72h: number;
  greaterThan72h: number;
}

export interface SignalActionCoverageDTO {
  totalActiveSignals: number;
  actionedSignalsCount: number;
  unactionedSignalsCount: number;
  coveragePercentage: number;
  criticalSignalsUnactioned: number;
}

export interface ResolutionMetricsDTO {
  totalActions: number;
  openCount: number;
  assignedCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
  averageTimeToResolutionHours: number | null;
}

export interface OperationalCommandCenterDTO {
  timestamp: string;

  scope: {
    blockId: string | 'ALL';
    userRole: string;
  };

  systemStatus: {
    forecastServiceStatus: string;
    modelRegistryStatus: string;
    dataFreshnessStatus: string;
    validationStatus: string;
    activeDataset: string;
    scientificDisclosures: string[];
  };

  signalSummary: {
    total: number;

    bySeverity: {
      CRITICAL: number;
      WARNING: number;
      WATCH: number;
      INFO: number;
    };

    byType: Record<string, number>;
  };

  actionSummary: ResolutionMetricsDTO;

  coverage: SignalActionCoverageDTO;

  aging: AgingDistributionDTO;

  attentionQueue: AttentionQueueItemDTO[];

  recentActivity: Array<{
    id: string;
    actionId: string;
    transition: string;
    performedBy: string;
    role: string;
    timestamp: string;
    notes?: string;
  }>;
}

export interface AuthenticatedUserContext {
  userId: string;
  role: string | UserRole;
  assignedLocationId?: string;
  blockId?: string;
}

export interface CommandCenterFilters {
  blockId?: string;
  timeHorizon?: string; // '24h' | '7d' | '30d'
}

interface InternalAttentionQueueItem extends AttentionQueueItemDTO {
  tier: number;
}

const SUPPORTED_TIME_HORIZONS = ['24h', '7d', '30d'] as const;

/**
 * Normalizes priority from action document or severity
 */
function normalizePriority(
  priority?: string,
  severity?: SignalSeverity
): 'P1' | 'P2' | 'P3' | 'P4' {
  if (priority === 'P1' || priority === 'CRITICAL') return 'P1';
  if (priority === 'P2' || priority === 'HIGH') return 'P2';
  if (priority === 'P3' || priority === 'MEDIUM') return 'P3';
  if (priority === 'P4' || priority === 'LOW') return 'P4';

  if (severity === 'CRITICAL') return 'P1';
  if (severity === 'WARNING') return 'P2';
  if (severity === 'WATCH') return 'P3';
  return 'P4';
}

/**
 * Pure helper: Computes the age in hours from an authoritative timestamp relative to "now".
 */
export function calculateAgeHours(
  timestamp: Date | string | number,
  now: Date = new Date()
): number {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (isNaN(date.getTime())) {
    return 0;
  }
  const diffMs = now.getTime() - date.getTime();
  const hours = Math.max(0, diffMs / (1000 * 60 * 60));
  return Number(hours.toFixed(2));
}

/**
 * Pure helper: Buckets actions into deterministic operational aging categories.
 */
export function calculateAgingDistribution(
  actions: Array<{ createdAt: Date | string }>,
  now: Date = new Date()
): AgingDistributionDTO {
  const distribution: AgingDistributionDTO = {
    lessThan1h: 0,
    between1hAnd6h: 0,
    between6hAnd24h: 0,
    between24hAnd72h: 0,
    greaterThan72h: 0,
  };

  for (const action of actions) {
    const ageHours = calculateAgeHours(action.createdAt, now);
    if (ageHours < 1) {
      distribution.lessThan1h += 1;
    } else if (ageHours < 6) {
      distribution.between1hAnd6h += 1;
    } else if (ageHours < 24) {
      distribution.between6hAnd24h += 1;
    } else if (ageHours < 72) {
      distribution.between24hAnd72h += 1;
    } else {
      distribution.greaterThan72h += 1;
    }
  }

  return distribution;
}

/**
 * Pure helper: Calculates coverage percentage and metrics between active signals and actions.
 * A signal is considered actioned if it has at least one associated non-cancelled inspection action.
 */
export function calculateCoverage(
  signals: OperationalSignalDTO[],
  actions: Array<{ signalId: string; status: string }>
): SignalActionCoverageDTO {
  const totalActiveSignals = signals.length;

  const actionedSignalIds = new Set<string>();
  for (const action of actions) {
    if (action.status !== 'CANCELLED' && action.signalId) {
      actionedSignalIds.add(action.signalId);
    }
  }

  let actionedSignalsCount = 0;
  let criticalSignalsUnactioned = 0;

  for (const signal of signals) {
    const isActioned = actionedSignalIds.has(signal.signalId);
    if (isActioned) {
      actionedSignalsCount += 1;
    } else if (signal.severity === 'CRITICAL') {
      criticalSignalsUnactioned += 1;
    }
  }

  const unactionedSignalsCount = Math.max(0, totalActiveSignals - actionedSignalsCount);
  const coveragePercentage =
    totalActiveSignals > 0
      ? Number(((actionedSignalsCount / totalActiveSignals) * 100).toFixed(2))
      : 0;

  return {
    totalActiveSignals,
    actionedSignalsCount,
    unactionedSignalsCount,
    coveragePercentage,
    criticalSignalsUnactioned,
  };
}

/**
 * Pure helper: Computes counts by status and average resolution time in hours for completed actions.
 */
export function calculateResolutionMetrics(
  actions: Array<{
    status: string;
    createdAt: Date | string;
    startedAt?: Date | string | null;
    completedAt?: Date | string | null;
  }>
): ResolutionMetricsDTO {
  let openCount = 0;
  let assignedCount = 0;
  let inProgressCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;

  const resolutionDurations: number[] = [];

  for (const action of actions) {
    switch (action.status) {
      case 'OPEN':
        openCount += 1;
        break;
      case 'ASSIGNED':
        assignedCount += 1;
        break;
      case 'IN_PROGRESS':
        inProgressCount += 1;
        break;
      case 'COMPLETED':
        completedCount += 1;
        if (action.completedAt) {
          const completedTime =
            action.completedAt instanceof Date
              ? action.completedAt.getTime()
              : new Date(action.completedAt).getTime();
          const startTime = action.startedAt
            ? action.startedAt instanceof Date
              ? action.startedAt.getTime()
              : new Date(action.startedAt).getTime()
            : action.createdAt instanceof Date
            ? action.createdAt.getTime()
            : new Date(action.createdAt).getTime();

          if (!isNaN(completedTime) && !isNaN(startTime) && completedTime >= startTime) {
            const durationHours = (completedTime - startTime) / (1000 * 60 * 60);
            resolutionDurations.push(durationHours);
          }
        }
        break;
      case 'CANCELLED':
        cancelledCount += 1;
        break;
      default:
        break;
    }
  }

  const averageTimeToResolutionHours =
    resolutionDurations.length > 0
      ? Number(
          (
            resolutionDurations.reduce((sum, d) => sum + d, 0) /
            resolutionDurations.length
          ).toFixed(2)
        )
      : null;

  return {
    totalActions: actions.length,
    openCount,
    assignedCount,
    inProgressCount,
    completedCount,
    cancelledCount,
    averageTimeToResolutionHours,
  };
}

/**
 * Pure helper: Builds the deterministic Attention Queue across signals and actions.
 */
export function buildAttentionQueue(
  signals: OperationalSignalDTO[],
  actions: IInspectionAction[],
  now: Date = new Date()
): AttentionQueueItemDTO[] {
  const actionedSignalIds = new Set<string>();
  for (const action of actions) {
    if (action.status !== 'CANCELLED' && action.signalId) {
      actionedSignalIds.add(action.signalId);
    }
  }

  const seenKeys = new Set<string>();
  const queueCandidates: InternalAttentionQueueItem[] = [];

  const addCandidate = (item: InternalAttentionQueueItem) => {
    const key = `${item.sourceType}:${item.sourceId}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      queueCandidates.push(item);
    }
  };

  // ---------------------------------------------------------
  // TIER 1 — EMERGENCY
  // 1. Active CRITICAL signals with zero associated inspection actions.
  // 2. P1 inspection actions in OPEN state with age > 6 hours.
  // ---------------------------------------------------------
  for (const signal of signals) {
    if (signal.severity === 'CRITICAL' && !actionedSignalIds.has(signal.signalId)) {
      const detectedAt = signal.detectedAt || signal.createdAt || now.toISOString();
      addCandidate({
        id: `att_sig_${signal.signalId}`,
        sourceType: 'SIGNAL',
        sourceId: signal.signalId,
        title: signal.title,
        severity: 'CRITICAL',
        priority: 'P1',
        reason: 'UNACTIONED_CRITICAL_SIGNAL',
        blockId: signal.blockId,
        status: signal.operationalStatus || 'ACTIVE',
        ageHours: calculateAgeHours(detectedAt, now),
        detectedAt,
        tier: 1,
      });
    }
  }

  for (const action of actions) {
    const priority = normalizePriority(action.priority);
    const ageHours = calculateAgeHours(action.createdAt, now);
    if (priority === 'P1' && action.status === 'OPEN' && ageHours > 6) {
      const detectedAt =
        action.createdAt instanceof Date
          ? action.createdAt.toISOString()
          : new Date(action.createdAt).toISOString();
      addCandidate({
        id: `att_act_${action.actionId}`,
        sourceType: 'ACTION',
        sourceId: action.actionId,
        title: action.title,
        severity: 'CRITICAL',
        priority: 'P1',
        reason: 'OVERDUE_P1_ACTION',
        blockId: action.blockId,
        status: action.status,
        assignedTo: action.assignedTo || undefined,
        ageHours,
        detectedAt,
        tier: 1,
      });
    }
  }

  // ---------------------------------------------------------
  // TIER 2 — HIGH PRIORITY
  // 1. P1 inspection actions in OPEN state and currently UNASSIGNED, age <= 6 hours.
  // 2. Active WARNING signals with zero associated inspection actions.
  // 3. P1 or P2 inspection actions in IN_PROGRESS state with age > 24 hours.
  // ---------------------------------------------------------
  for (const action of actions) {
    const priority = normalizePriority(action.priority);
    const ageHours = calculateAgeHours(action.createdAt, now);
    if (priority === 'P1' && action.status === 'OPEN' && !action.assignedTo && ageHours <= 6) {
      const detectedAt =
        action.createdAt instanceof Date
          ? action.createdAt.toISOString()
          : new Date(action.createdAt).toISOString();
      addCandidate({
        id: `att_act_${action.actionId}`,
        sourceType: 'ACTION',
        sourceId: action.actionId,
        title: action.title,
        severity: 'CRITICAL',
        priority: 'P1',
        reason: 'UNASSIGNED_HIGH_PRIORITY',
        blockId: action.blockId,
        status: action.status,
        assignedTo: undefined,
        ageHours,
        detectedAt,
        tier: 2,
      });
    }
  }

  for (const signal of signals) {
    if (signal.severity === 'WARNING' && !actionedSignalIds.has(signal.signalId)) {
      const detectedAt = signal.detectedAt || signal.createdAt || now.toISOString();
      addCandidate({
        id: `att_sig_${signal.signalId}`,
        sourceType: 'SIGNAL',
        sourceId: signal.signalId,
        title: signal.title,
        severity: 'WARNING',
        priority: 'P2',
        reason: 'UNASSIGNED_HIGH_PRIORITY',
        blockId: signal.blockId,
        status: signal.operationalStatus || 'ACTIVE',
        ageHours: calculateAgeHours(detectedAt, now),
        detectedAt,
        tier: 2,
      });
    }
  }

  for (const action of actions) {
    const priority = normalizePriority(action.priority);
    const ageHours = calculateAgeHours(action.createdAt, now);
    if ((priority === 'P1' || priority === 'P2') && action.status === 'IN_PROGRESS' && ageHours > 24) {
      const detectedAt =
        action.createdAt instanceof Date
          ? action.createdAt.toISOString()
          : new Date(action.createdAt).toISOString();
      addCandidate({
        id: `att_act_${action.actionId}`,
        sourceType: 'ACTION',
        sourceId: action.actionId,
        title: action.title,
        severity: priority === 'P1' ? 'CRITICAL' : 'WARNING',
        priority,
        reason: 'STALLED_IN_PROGRESS',
        blockId: action.blockId,
        status: action.status,
        assignedTo: action.assignedTo || undefined,
        ageHours,
        detectedAt,
        tier: 2,
      });
    }
  }

  // ---------------------------------------------------------
  // TIER 3 — SUPERVISORY ROUTING
  // 1. P2 inspection actions in OPEN or ASSIGNED state.
  // 2. Active WATCH signals without associated actions.
  // ---------------------------------------------------------
  for (const action of actions) {
    const priority = normalizePriority(action.priority);
    const ageHours = calculateAgeHours(action.createdAt, now);
    if (priority === 'P2' && (action.status === 'OPEN' || action.status === 'ASSIGNED')) {
      const detectedAt =
        action.createdAt instanceof Date
          ? action.createdAt.toISOString()
          : new Date(action.createdAt).toISOString();
      addCandidate({
        id: `att_act_${action.actionId}`,
        sourceType: 'ACTION',
        sourceId: action.actionId,
        title: action.title,
        severity: 'WARNING',
        priority: 'P2',
        reason: !action.assignedTo ? 'UNASSIGNED_HIGH_PRIORITY' : 'ROUTINE_MONITORING',
        blockId: action.blockId,
        status: action.status,
        assignedTo: action.assignedTo || undefined,
        ageHours,
        detectedAt,
        tier: 3,
      });
    }
  }

  for (const signal of signals) {
    if (signal.severity === 'WATCH' && !actionedSignalIds.has(signal.signalId)) {
      const detectedAt = signal.detectedAt || signal.createdAt || now.toISOString();
      addCandidate({
        id: `att_sig_${signal.signalId}`,
        sourceType: 'SIGNAL',
        sourceId: signal.signalId,
        title: signal.title,
        severity: 'WATCH',
        priority: 'P3',
        reason: 'ROUTINE_MONITORING',
        blockId: signal.blockId,
        status: signal.operationalStatus || 'ACTIVE',
        ageHours: calculateAgeHours(detectedAt, now),
        detectedAt,
        tier: 3,
      });
    }
  }

  // ---------------------------------------------------------
  // TIER 4 — ROUTINE TRIAGE
  // 1. P3 and P4 actions in OPEN state.
  // 2. INFO signals.
  // ---------------------------------------------------------
  for (const action of actions) {
    const priority = normalizePriority(action.priority);
    const ageHours = calculateAgeHours(action.createdAt, now);
    if ((priority === 'P3' || priority === 'P4') && action.status === 'OPEN') {
      const detectedAt =
        action.createdAt instanceof Date
          ? action.createdAt.toISOString()
          : new Date(action.createdAt).toISOString();
      addCandidate({
        id: `att_act_${action.actionId}`,
        sourceType: 'ACTION',
        sourceId: action.actionId,
        title: action.title,
        severity: priority === 'P3' ? 'WATCH' : 'INFO',
        priority,
        reason: 'ROUTINE_MONITORING',
        blockId: action.blockId,
        status: action.status,
        assignedTo: action.assignedTo || undefined,
        ageHours,
        detectedAt,
        tier: 4,
      });
    }
  }

  for (const signal of signals) {
    if (signal.severity === 'INFO') {
      const detectedAt = signal.detectedAt || signal.createdAt || now.toISOString();
      addCandidate({
        id: `att_sig_${signal.signalId}`,
        sourceType: 'SIGNAL',
        sourceId: signal.signalId,
        title: signal.title,
        severity: 'INFO',
        priority: 'P4',
        reason: 'ROUTINE_MONITORING',
        blockId: signal.blockId,
        status: signal.operationalStatus || 'ACTIVE',
        ageHours: calculateAgeHours(detectedAt, now),
        detectedAt,
        tier: 4,
      });
    }
  }

  // Sort deterministically:
  // 1. Tier ascending (Tier 1 before Tier 2, etc.)
  // 2. Age descending (oldest item first)
  // 3. sourceType ascending ('ACTION' vs 'SIGNAL')
  // 4. sourceId ascending
  queueCandidates.sort((a, b) => {
    if (a.tier !== b.tier) {
      return a.tier - b.tier;
    }
    if (b.ageHours !== a.ageHours) {
      return b.ageHours - a.ageHours;
    }
    if (a.sourceType !== b.sourceType) {
      return a.sourceType.localeCompare(b.sourceType);
    }
    return a.sourceId.localeCompare(b.sourceId);
  });

  return queueCandidates.map(({ tier, ...item }) => item);
}

/**
 * Pure helper: Builds recent activity entries from persisted inspection action audit trails.
 */
export function buildRecentActivity(
  actions: IInspectionAction[],
  limit: number = 20
): OperationalCommandCenterDTO['recentActivity'] {
  const entries: OperationalCommandCenterDTO['recentActivity'] = [];

  for (const action of actions) {
    if (!Array.isArray(action.auditTrail)) continue;

    action.auditTrail.forEach((entry, idx) => {
      const timestampStr =
        entry.timestamp instanceof Date
          ? entry.timestamp.toISOString()
          : new Date(entry.timestamp).toISOString();

      entries.push({
        id: `act_audit_${action.actionId}_${idx}`,
        actionId: action.actionId,
        transition: `${entry.from} -> ${entry.to}`,
        performedBy: entry.actorId || 'system',
        role: entry.actorRole || 'UNKNOWN',
        timestamp: timestampStr,
        notes: entry.reason,
      });
    });
  }

  // Sort newest first; secondary deterministic sort by id
  entries.sort((a, b) => {
    const timeDiff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    if (timeDiff !== 0) {
      return timeDiff;
    }
    return a.id.localeCompare(b.id);
  });

  return entries.slice(0, limit);
}

export const commandCenterService = {
  /**
   * Authoritative aggregation orchestrator for Operational Command Center
   */
  async getCommandCenter(
    context: AuthenticatedUserContext,
    filters?: CommandCenterFilters
  ): Promise<OperationalCommandCenterDTO> {
    const { role, assignedLocationId } = context;

    // 1. Time Horizon validation & cutoff calculation
    const timeHorizon = filters?.timeHorizon || '7d';
    if (!SUPPORTED_TIME_HORIZONS.includes(timeHorizon as any)) {
      throw new BadRequestError(
        `Invalid timeHorizon: "${timeHorizon}". Supported values are: ${SUPPORTED_TIME_HORIZONS.join(', ')}`
      );
    }

    const horizonHours = timeHorizon === '24h' ? 24 : timeHorizon === '7d' ? 168 : 720;
    const now = new Date();
    const horizonCutoff = new Date(now.getTime() - horizonHours * 60 * 60 * 1000);

    // 2. Server-side RBAC & Geographic Boundary Enforcement
    let targetBlock: string | undefined = filters?.blockId;

    if (role === 'FARMER') {
      const allowedBlock = await operationalSignalService.resolveAllowedBlock(assignedLocationId);
      if (filters?.blockId && filters.blockId !== allowedBlock) {
        throw new ForbiddenError('Farmers are strictly restricted to their assigned operational block');
      }
      targetBlock = allowedBlock;
    } else if (role === 'OFFICER') {
      const allowedBlock = await operationalSignalService.resolveAllowedBlock(assignedLocationId);
      if (filters?.blockId && filters.blockId !== allowedBlock) {
        throw new ForbiddenError('Field Officers are restricted to their assigned administrative block');
      }
      targetBlock = filters?.blockId || allowedBlock;
    }

    // 3. Signal Aggregation via Phase 7A Operational Signal Service
    const signals = await operationalSignalService.getSignals(
      {
        blockId: targetBlock,
        limit: 100,
      },
      {
        userId: context.userId,
        role: context.role as UserRole,
        assignedLocationId: context.assignedLocationId,
      }
    );

    // Filter signals by time horizon
    const horizonSignals = signals.filter((s) => {
      const date = new Date(s.detectedAt || s.createdAt);
      return isNaN(date.getTime()) || date >= horizonCutoff;
    });

    const signalSummary = {
      total: horizonSignals.length,
      bySeverity: {
        CRITICAL: 0,
        WARNING: 0,
        WATCH: 0,
        INFO: 0,
      },
      byType: {} as Record<string, number>,
    };

    for (const signal of horizonSignals) {
      if (signal.severity in signalSummary.bySeverity) {
        signalSummary.bySeverity[signal.severity] += 1;
      }
      signalSummary.byType[signal.signalType] = (signalSummary.byType[signal.signalType] || 0) + 1;
    }

    // 4. Action Aggregation via Phase 7C Repository
    const actionFilters: ActionFilters = {
      blockId: targetBlock,
      limit: 200,
    };
    const actions = await inspectionActionRepository.listActions(actionFilters);

    // Filter actions by time horizon
    const horizonActions = actions.filter((a) => {
      const date = new Date(a.createdAt);
      return isNaN(date.getTime()) || date >= horizonCutoff;
    });

    // 5. Calculations
    const coverage = calculateCoverage(horizonSignals, horizonActions);
    const actionSummary = calculateResolutionMetrics(horizonActions);
    const aging = calculateAgingDistribution(horizonActions, now);
    const attentionQueue = buildAttentionQueue(horizonSignals, horizonActions, now);
    const recentActivity = buildRecentActivity(horizonActions, 20);

    // 6. System Status & Scientific Disclosures
    let systemStatus = {
      forecastServiceStatus: 'DIAGNOSTIC_ONLY',
      modelRegistryStatus: 'OPERATIONAL_CALIBRATED_BENCHMARKS_ACTIVE',
      dataFreshnessStatus: 'HISTORICAL_ONLY',
      validationStatus: 'INSUFFICIENT_DATA',
      activeDataset: 'Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT, 122 daily records)',
      scientificDisclosures: [
        'All operational forecasting is gated under DIAGNOSTIC_ONLY status.',
        'Observational data is restricted to historical Kharif 2024 baseline (Bakshi Ka Talab, UP_LKO_BKT, 122 daily records).',
        'Multi-year hindcast validation gate status is INSUFFICIENT_DATA (requires >= 2 seasons; multi-season / Rabi forecasting disabled).',
        'Notification delivery operates in provider-neutral internal simulation mode only.',
        'Agronomic crop decision commands (sowing, spraying, irrigation, harvest) and automated farm actuation are strictly disabled.',
      ],
    };

    try {
      const mlStatus = await mlGatewayClient.get<any>('/operations/status');
      if (mlStatus) {
        systemStatus = {
          forecastServiceStatus: mlStatus.forecast_service_status || systemStatus.forecastServiceStatus,
          modelRegistryStatus: mlStatus.model_registry_status || systemStatus.modelRegistryStatus,
          dataFreshnessStatus: mlStatus.data_freshness_status || systemStatus.dataFreshnessStatus,
          validationStatus: mlStatus.validation_status || systemStatus.validationStatus,
          activeDataset: mlStatus.active_dataset || systemStatus.activeDataset,
          scientificDisclosures:
            Array.isArray(mlStatus.scientific_disclosures) && mlStatus.scientific_disclosures.length > 0
              ? mlStatus.scientific_disclosures
              : systemStatus.scientificDisclosures,
        };
      }
    } catch {
      // Diagnostic fallback preserves scientific disclosures seamlessly
    }

    return {
      timestamp: now.toISOString(),
      scope: {
        blockId: targetBlock || 'ALL',
        userRole: String(role),
      },
      systemStatus,
      signalSummary,
      actionSummary,
      coverage,
      aging,
      attentionQueue,
      recentActivity,
    };
  },
};
