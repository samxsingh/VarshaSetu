import {
  inspectionActionRepository,
  ActionFilters,
} from '../../repositories/inspectionActionRepository';
import {
  IInspectionAction,
  IInspectionAuditEntry,
  InspectionActionType,
  InspectionActionStatus,
  InspectionActionPriority,
} from '../../models/InspectionAction';
import { operationalSignalService } from './operationalSignalService';
import { realtimeService } from '../../realtime/socketEvents';
import { InspectionActionRealtimeDTO } from '../../realtime/types';
import { UserRole } from '@shared/types';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../utils/errors';

export interface AuthenticatedUserContext {
  userId: string;
  role: UserRole;
  assignedLocationId?: string;
}

export interface CreateInspectionActionInput {
  signalId: string;
  actionType: InspectionActionType;
  title?: string;
  description?: string;
  priority?: InspectionActionPriority;
  assignedTo?: string;
}

export interface InspectionActionDTO {
  actionId: string;
  signalId: string;
  blockId: string;
  actionType: InspectionActionType;
  title: string;
  description: string;
  status: InspectionActionStatus;
  priority: InspectionActionPriority;
  createdBy: string;
  assignedTo: string | null;
  createdAt: string;
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  completionNotes: string | null;
  cancellationReason: string | null;
  sourceSignal: Record<string, unknown>;
  auditTrail: Array<{
    from: string;
    to: string;
    actorId: string;
    actorRole: string;
    timestamp: string;
    reason: string;
  }>;
  updatedAt: string;
}

const VALID_ACTION_TYPES: InspectionActionType[] = [
  'DATA_QUALITY_CHECK',
  'STATION_INSPECTION',
  'FORECAST_REVIEW',
  'ADVISORY_REVIEW',
  'MODEL_EVIDENCE_REVIEW',
  'FIELD_OBSERVATION',
];

const DEFAULT_TITLES: Record<InspectionActionType, string> = {
  DATA_QUALITY_CHECK: 'Telemetry Ingestion & Data Quality Review',
  STATION_INSPECTION: 'Agro-Meteorological Station Physical Verification',
  FORECAST_REVIEW: 'Numerical Forecast Reliability & Boundary Review',
  ADVISORY_REVIEW: 'Operational Agronomic Advisory Audit',
  MODEL_EVIDENCE_REVIEW: 'Calibrated ML Model Performance & SHAP Audit',
  FIELD_OBSERVATION: 'Field Sector Soil & Precipitation Ground Truthing',
};

function formatDocToDTO(doc: IInspectionAction): InspectionActionDTO {
  const obj = typeof (doc as any).toObject === 'function' ? (doc as any).toObject() : doc;
  return {
    actionId: obj.actionId,
    signalId: obj.signalId,
    blockId: obj.blockId,
    actionType: obj.actionType,
    title: obj.title,
    description: obj.description,
    status: obj.status,
    priority: obj.priority,
    createdBy: obj.createdBy,
    assignedTo: obj.assignedTo || null,
    createdAt: obj.createdAt instanceof Date ? obj.createdAt.toISOString() : new Date(obj.createdAt).toISOString(),
    assignedAt: obj.assignedAt ? (obj.assignedAt instanceof Date ? obj.assignedAt.toISOString() : new Date(obj.assignedAt).toISOString()) : null,
    startedAt: obj.startedAt ? (obj.startedAt instanceof Date ? obj.startedAt.toISOString() : new Date(obj.startedAt).toISOString()) : null,
    completedAt: obj.completedAt ? (obj.completedAt instanceof Date ? obj.completedAt.toISOString() : new Date(obj.completedAt).toISOString()) : null,
    cancelledAt: obj.cancelledAt ? (obj.cancelledAt instanceof Date ? obj.cancelledAt.toISOString() : new Date(obj.cancelledAt).toISOString()) : null,
    completionNotes: obj.completionNotes || null,
    cancellationReason: obj.cancellationReason || null,
    sourceSignal: obj.sourceSignal || {},
    auditTrail: (obj.auditTrail || []).map((entry: any) => ({
      from: entry.from,
      to: entry.to,
      actorId: entry.actorId,
      actorRole: entry.actorRole,
      timestamp: entry.timestamp instanceof Date ? entry.timestamp.toISOString() : new Date(entry.timestamp).toISOString(),
      reason: entry.reason,
    })),
    updatedAt: obj.updatedAt instanceof Date ? obj.updatedAt.toISOString() : new Date(obj.updatedAt).toISOString(),
  };
}

function toRealtimeDTO(dto: InspectionActionDTO): InspectionActionRealtimeDTO {
  return {
    actionId: dto.actionId,
    signalId: dto.signalId,
    blockId: dto.blockId,
    actionType: dto.actionType,
    title: dto.title,
    status: dto.status,
    priority: dto.priority,
    assignedTo: dto.assignedTo,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export const inspectionActionService = {
  /**
   * Creates an operational inspection action originated from a verified signal.
   */
  async createAction(
    input: CreateInspectionActionInput,
    user: AuthenticatedUserContext
  ): Promise<InspectionActionDTO> {
    if (!input.signalId) {
      throw new BadRequestError('signalId is required');
    }

    // 1. Verify signal exists
    const signalResult = await operationalSignalService.getSignalById(input.signalId);
    if (!signalResult || !signalResult.signal) {
      throw new NotFoundError('Operational signal not found');
    }
    const signal = signalResult.signal;

    // 2. Geographic authorization & RBAC checks
    const allowedBlock = await operationalSignalService.resolveAllowedBlock(user.assignedLocationId);

    if (user.role === 'FARMER') {
      if (signal.signalType === 'MODEL_STATUS' || signal.signalType === 'OPERATIONAL_GATE') {
        throw new ForbiddenError('Access forbidden: Farmers cannot access internal model or gate status signals');
      }
      if (signal.blockId !== allowedBlock) {
        throw new ForbiddenError('Access forbidden: Signal belongs to a foreign block');
      }
    } else if (user.role === 'OFFICER') {
      if (user.assignedLocationId && signal.blockId !== allowedBlock) {
        throw new ForbiddenError('Access forbidden: Signal is outside assigned jurisdiction');
      }
    }

    // 3. Validate action type
    if (!VALID_ACTION_TYPES.includes(input.actionType)) {
      throw new BadRequestError(`Invalid inspection action type: ${input.actionType}`);
    }

    const title = input.title?.trim() || DEFAULT_TITLES[input.actionType];
    const description =
      input.description?.trim() ||
      `Operational inspection initiated for signal "${signal.title}" (${signal.severity}) in block ${signal.blockId}. Traceability and ground verification required.`;
    const priority = input.priority || (signal.severity === 'CRITICAL' ? 'CRITICAL' : signal.severity === 'WARNING' ? 'HIGH' : 'MEDIUM');

    // 4. Generate unique actionId
    const actionId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const initialAudit: IInspectionAuditEntry = {
      from: 'NONE',
      to: 'OPEN',
      actorId: user.userId,
      actorRole: user.role,
      timestamp: new Date(),
      reason: 'Inspection action created from operational signal',
    };

    const sourceSignal = {
      signalId: signal.signalId,
      signalType: signal.signalType,
      title: signal.title,
      severity: signal.severity,
      blockId: signal.blockId,
      detectedAt: signal.detectedAt,
      operationalStatus: signal.operationalStatus,
      confidenceStatus: signal.confidenceStatus,
    };

    // 5. Persist via repository
    const doc = await inspectionActionRepository.createAction({
      actionId,
      signalId: signal.signalId,
      blockId: signal.blockId,
      actionType: input.actionType,
      title,
      description,
      status: 'OPEN',
      priority,
      createdBy: user.userId,
      assignedTo: input.assignedTo || null,
      assignedAt: input.assignedTo ? new Date() : null,
      sourceSignal,
      auditTrail: [initialAudit],
    });

    const dto = formatDocToDTO(doc);

    // 6. Emit realtime event
    realtimeService.emitInspectionCreated(toRealtimeDTO(dto));

    return dto;
  },

  /**
   * Lists inspection actions filtered by role and geographic authorization.
   */
  async listActions(
    query: {
      blockId?: string;
      status?: InspectionActionStatus;
      actionType?: InspectionActionType;
      assignedTo?: string;
      signalId?: string;
      limit?: number;
    } = {},
    user: AuthenticatedUserContext
  ): Promise<InspectionActionDTO[]> {
    const allowedBlock = await operationalSignalService.resolveAllowedBlock(user.assignedLocationId);
    const filters: ActionFilters = { ...query };

    if (user.role === 'FARMER') {
      filters.blockId = allowedBlock;
    } else if (user.role === 'OFFICER') {
      if (user.assignedLocationId) {
        filters.blockId = allowedBlock;
      }
    } else if (query.blockId) {
      filters.blockId = query.blockId;
    }

    const docs = await inspectionActionRepository.listActions(filters);
    return docs.map(formatDocToDTO);
  },

  /**
   * Retrieves an inspection action by ID with authoritative access checking.
   */
  async getActionById(
    actionId: string,
    user: AuthenticatedUserContext
  ): Promise<InspectionActionDTO> {
    const doc = await inspectionActionRepository.getActionById(actionId);
    if (!doc) {
      throw new NotFoundError('Inspection action not found');
    }

    const allowedBlock = await operationalSignalService.resolveAllowedBlock(user.assignedLocationId);
    if (user.role === 'FARMER') {
      if (doc.blockId !== allowedBlock) {
        throw new ForbiddenError('Access forbidden: Action belongs to a foreign block');
      }
    } else if (user.role === 'OFFICER' && user.assignedLocationId) {
      if (doc.blockId !== allowedBlock) {
        throw new ForbiddenError('Access forbidden: Action is outside assigned jurisdiction');
      }
    }

    return formatDocToDTO(doc);
  },

  /**
   * Transitions an action from OPEN to ASSIGNED.
   */
  async assignAction(
    actionId: string,
    assignedTo: string,
    user: AuthenticatedUserContext,
    reason?: string
  ): Promise<InspectionActionDTO> {
    if (user.role === 'FARMER') {
      throw new ForbiddenError('Access forbidden: Farmers are not authorized to assign inspection actions');
    }

    if (!assignedTo || !assignedTo.trim()) {
      throw new BadRequestError('assignedTo is required');
    }

    const existing = await inspectionActionRepository.getActionById(actionId);
    if (!existing) {
      throw new NotFoundError('Inspection action not found');
    }

    // Geographic check
    const allowedBlock = await operationalSignalService.resolveAllowedBlock(user.assignedLocationId);
    if (user.role === 'OFFICER' && user.assignedLocationId && existing.blockId !== allowedBlock) {
      throw new ForbiddenError('Access forbidden: Action is outside assigned jurisdiction');
    }

    // Lifecycle check
    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      throw new BadRequestError(`Cannot mutate action in terminal state: ${existing.status}`);
    }

    if (existing.status !== 'OPEN' && existing.status !== 'ASSIGNED') {
      throw new BadRequestError(`Invalid lifecycle transition: Cannot transition from ${existing.status} to ASSIGNED`);
    }

    const auditEntry: IInspectionAuditEntry = {
      from: existing.status,
      to: 'ASSIGNED',
      actorId: user.userId,
      actorRole: user.role,
      timestamp: new Date(),
      reason: reason?.trim() || `Assigned to ${assignedTo} for ground verification`,
    };

    const updated = await inspectionActionRepository.assignAction(actionId, assignedTo.trim(), auditEntry);
    if (!updated) {
      throw new Error('Failed to update action');
    }

    const dto = formatDocToDTO(updated);
    realtimeService.emitInspectionAssigned(toRealtimeDTO(dto));
    return dto;
  },

  /**
   * Transitions an action from ASSIGNED to IN_PROGRESS.
   */
  async startAction(
    actionId: string,
    user: AuthenticatedUserContext,
    reason?: string
  ): Promise<InspectionActionDTO> {
    const existing = await inspectionActionRepository.getActionById(actionId);
    if (!existing) {
      throw new NotFoundError('Inspection action not found');
    }

    // Geographic check
    const allowedBlock = await operationalSignalService.resolveAllowedBlock(user.assignedLocationId);
    if (user.role === 'FARMER') {
      if (existing.blockId !== allowedBlock) {
        throw new ForbiddenError('Access forbidden: Action belongs to a foreign block');
      }
    } else if (user.role === 'OFFICER' && user.assignedLocationId && existing.blockId !== allowedBlock) {
      throw new ForbiddenError('Access forbidden: Action is outside assigned jurisdiction');
    }

    // Lifecycle check
    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      throw new BadRequestError(`Cannot mutate action in terminal state: ${existing.status}`);
    }

    if (existing.status !== 'ASSIGNED') {
      throw new BadRequestError(`Invalid lifecycle transition: Action must be in ASSIGNED status to start (current: ${existing.status})`);
    }

    const auditEntry: IInspectionAuditEntry = {
      from: 'ASSIGNED',
      to: 'IN_PROGRESS',
      actorId: user.userId,
      actorRole: user.role,
      timestamp: new Date(),
      reason: reason?.trim() || 'Inspection action execution commenced',
    };

    const updated = await inspectionActionRepository.startAction(actionId, auditEntry);
    if (!updated) {
      throw new Error('Failed to start action');
    }

    const dto = formatDocToDTO(updated);
    realtimeService.emitInspectionStarted(toRealtimeDTO(dto));
    return dto;
  },

  /**
   * Transitions an action from IN_PROGRESS to COMPLETED.
   */
  async completeAction(
    actionId: string,
    completionNotes: string,
    user: AuthenticatedUserContext
  ): Promise<InspectionActionDTO> {
    if (!completionNotes || !completionNotes.trim()) {
      throw new BadRequestError('completionNotes is required');
    }

    const existing = await inspectionActionRepository.getActionById(actionId);
    if (!existing) {
      throw new NotFoundError('Inspection action not found');
    }

    // Geographic check
    const allowedBlock = await operationalSignalService.resolveAllowedBlock(user.assignedLocationId);
    if (user.role === 'FARMER') {
      if (existing.blockId !== allowedBlock) {
        throw new ForbiddenError('Access forbidden: Action belongs to a foreign block');
      }
    } else if (user.role === 'OFFICER' && user.assignedLocationId && existing.blockId !== allowedBlock) {
      throw new ForbiddenError('Access forbidden: Action is outside assigned jurisdiction');
    }

    // Lifecycle check
    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      throw new BadRequestError(`Cannot mutate action in terminal state: ${existing.status}`);
    }

    if (existing.status !== 'IN_PROGRESS') {
      throw new BadRequestError(`Invalid lifecycle transition: Action must be IN_PROGRESS to complete (current: ${existing.status})`);
    }

    const auditEntry: IInspectionAuditEntry = {
      from: 'IN_PROGRESS',
      to: 'COMPLETED',
      actorId: user.userId,
      actorRole: user.role,
      timestamp: new Date(),
      reason: completionNotes.trim(),
    };

    const updated = await inspectionActionRepository.completeAction(actionId, completionNotes.trim(), auditEntry);
    if (!updated) {
      throw new Error('Failed to complete action');
    }

    const dto = formatDocToDTO(updated);
    realtimeService.emitInspectionCompleted(toRealtimeDTO(dto));
    return dto;
  },

  /**
   * Transitions an action from OPEN, ASSIGNED, or IN_PROGRESS to CANCELLED.
   */
  async cancelAction(
    actionId: string,
    cancellationReason: string,
    user: AuthenticatedUserContext
  ): Promise<InspectionActionDTO> {
    if (!cancellationReason || !cancellationReason.trim()) {
      throw new BadRequestError('cancellationReason is required');
    }

    const existing = await inspectionActionRepository.getActionById(actionId);
    if (!existing) {
      throw new NotFoundError('Inspection action not found');
    }

    // Geographic check
    const allowedBlock = await operationalSignalService.resolveAllowedBlock(user.assignedLocationId);
    if (user.role === 'FARMER') {
      if (existing.blockId !== allowedBlock) {
        throw new ForbiddenError('Access forbidden: Action belongs to a foreign block');
      }
    } else if (user.role === 'OFFICER' && user.assignedLocationId && existing.blockId !== allowedBlock) {
      throw new ForbiddenError('Access forbidden: Action is outside assigned jurisdiction');
    }

    // Lifecycle check
    if (existing.status === 'COMPLETED') {
      throw new BadRequestError('Cannot mutate action in terminal state: Action is already COMPLETED');
    }

    if (existing.status === 'CANCELLED') {
      throw new BadRequestError('Cannot mutate action in terminal state: Action is already CANCELLED');
    }

    const auditEntry: IInspectionAuditEntry = {
      from: existing.status,
      to: 'CANCELLED',
      actorId: user.userId,
      actorRole: user.role,
      timestamp: new Date(),
      reason: cancellationReason.trim(),
    };

    const updated = await inspectionActionRepository.cancelAction(actionId, cancellationReason.trim(), auditEntry);
    if (!updated) {
      throw new Error('Failed to cancel action');
    }

    const dto = formatDocToDTO(updated);
    realtimeService.emitInspectionCancelled(toRealtimeDTO(dto));
    return dto;
  },
};
