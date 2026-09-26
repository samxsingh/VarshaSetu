import { apiClient } from './apiClient';
import { ApiResponse } from '@shared/types';

export type OperationalSignalType =
  | 'EVENT'
  | 'FORECAST_CHANGE'
  | 'ADVISORY'
  | 'DATA_QUALITY'
  | 'MODEL_STATUS'
  | 'OPERATIONAL_GATE';

export type SignalSeverity = 'CRITICAL' | 'WARNING' | 'WATCH' | 'INFO';

export interface SignalSourceReference {
  id: string;
  type: string;
  label: string;
}

export interface OperationalSignalDTO {
  signalId: string;
  signalType: OperationalSignalType;
  title: string;
  summary: string;
  severity: SignalSeverity;
  blockId: string;
  detectedAt: string;
  validFrom: string;
  validUntil: string;
  probability: number | null;
  confidenceStatus: string;
  operationalStatus: string;
  dataFreshness: string;
  validationStatus: string;
  sourceReferences: SignalSourceReference[];
  recommendedInspection?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface GetSignalsQuery {
  blockId?: string;
  severity?: SignalSeverity;
  signalType?: OperationalSignalType;
  operationalStatus?: string;
  limit?: number;
  cursor?: string;
}

export interface SystemOperationalStatusResponse {
  forecast_service_status: string;
  model_registry_status: string;
  data_freshness_status: string;
  calibration_status: string;
  validation_status: string;
  event_engine_status: string;
  delivery_status: string;
  database_status: string;
  active_dataset: string;
  spatial_extent: string;
  scientific_disclosures: string[];
  timestamp: string;
}

export interface OperationalLocationContext {
  blockId: string;
  blockName: string;
  districtName: string;
  stateName: string;
}

export interface TimingContext {
  detectedAt: string;
  validFrom: string;
  validUntil: string;
}

export interface ScientificContext {
  probability: number | null;
  confidenceStatus: string;
  validationStatus: string;
  operationalStatus: string;
  dataFreshness: string;
  modelReliabilityLabel?: string;
}

export interface ModelReference {
  modelId?: string;
  modelFamily?: string;
  modelVersion?: string;
  algorithm?: string;
  calibrationMethod?: string;
  ece?: number;
  brierScore?: number;
}

export interface ObservationReference {
  source?: string;
  stationId?: string;
  stationName?: string;
  variable?: string;
  resolution?: string;
  observationCount?: number;
}

export interface FeatureContribution {
  featureName: string;
  contribution: number;
  direction: 'increases_risk' | 'decreases_risk' | 'neutral';
  description?: string;
}

export interface ExplanationContext {
  available: boolean;
  baseValue?: number;
  contributions: FeatureContribution[];
  nonCausalDisclaimer: string;
}

export interface DataHealthContext {
  available: boolean;
  providerStatus?: string;
  lastSyncTime?: string;
  dataFreshness?: string;
  qualityState?: string;
  pipelineStatus?: string;
}

export interface EvidenceContext {
  sourceReferences: SignalSourceReference[];
  provenanceAvailable: boolean;
  provenanceDetails?: Record<string, unknown>;
  modelReference?: ModelReference;
  observationReference?: ObservationReference;
  explanation?: ExplanationContext;
  dataHealth?: DataHealthContext;
}

export interface UnderlyingEntityContext {
  entityType: 'EVENT' | 'FORECAST' | 'ADVISORY' | 'DATA_HEALTH' | 'SYSTEM_GATE';
  entityId: string;
  details?: Record<string, unknown>;
}

export interface NextInspectionAction {
  label: string;
  actionType: 'NAVIGATE' | 'VIEW_DRAWER' | 'AUDIT';
  target: string;
  description: string;
}

export interface DecisionSupportContext {
  signalId: string;
  signalType: OperationalSignalType;
  title: string;
  summary: string;
  severity: SignalSeverity;
  location: OperationalLocationContext;
  timing: TimingContext;
  scientific: ScientificContext;
  evidence: EvidenceContext;
  underlyingEntity: UnderlyingEntityContext;
  recommendedInspection: string;
  limitations: string[];
  nextInspections: NextInspectionAction[];
}


export type InspectionActionType =
  | 'DATA_QUALITY_CHECK'
  | 'STATION_INSPECTION'
  | 'FORECAST_REVIEW'
  | 'ADVISORY_REVIEW'
  | 'MODEL_EVIDENCE_REVIEW'
  | 'FIELD_OBSERVATION';

export type InspectionActionStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type InspectionActionPriority = 'P1' | 'P2' | 'P3' | 'P4';

export interface InspectionActionAuditEntry {
  transition: string;
  performedBy: string;
  role: string;
  timestamp: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface InspectionActionDTO {
  actionId: string;
  signalId: string;
  actionType: InspectionActionType;
  title: string;
  description: string;
  severity: SignalSeverity;
  priority: InspectionActionPriority;
  blockId: string;
  status: InspectionActionStatus;
  assignedTo?: string;
  assignedRole?: string;
  createdBy: string;
  creatorRole: string;
  completionNotes?: string;
  cancellationReason?: string;
  evidenceSnapshot: {
    originatingSignalType: string;
    originatingSeverity: string;
    detectedAt: string;
    scientificDisclosures: string[];
    sourceReferences: Array<{ id: string; type: string; label: string }>;
  };
  auditTrail: InspectionActionAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInspectionActionInput {
  signalId: string;
  actionType: InspectionActionType;
  title: string;
  description: string;
  priority?: InspectionActionPriority;
  assignedTo?: string;
  notes?: string;
}

export interface ListInspectionActionsQuery {
  status?: InspectionActionStatus;
  actionType?: InspectionActionType;
  blockId?: string;
  assignedTo?: string;
  limit?: number;
  cursor?: string;
}

export const operationalService = {
  /**
   * Retrieves active operational intelligence signals
   */
  async getSignals(params?: GetSignalsQuery): Promise<ApiResponse<{ items: OperationalSignalDTO[]; total: number }>> {
    return apiClient.get<{ items: OperationalSignalDTO[]; total: number }>('/operations/signals', {
      params,
    });
  },

  /**
   * Retrieves operational system status
   */
  async getStatus(): Promise<ApiResponse<SystemOperationalStatusResponse>> {
    return apiClient.get<SystemOperationalStatusResponse>('/operations/status');
  },

  /**
   * Retrieves full decision support context for an operational signal
   */
  async getSignalContext(signalId: string): Promise<ApiResponse<DecisionSupportContext>> {
    return apiClient.get<DecisionSupportContext>(`/operations/signals/${encodeURIComponent(signalId)}/context`);
  },

  /**
   * Creates an operational inspection action from a verified signal
   */
  async createInspectionAction(input: CreateInspectionActionInput): Promise<ApiResponse<InspectionActionDTO>> {
    return apiClient.post<InspectionActionDTO>('/operations/actions', input);
  },

  /**
   * Retrieves inspection actions with optional filters
   */
  async getInspectionActions(params?: ListInspectionActionsQuery): Promise<ApiResponse<{ items: InspectionActionDTO[]; total: number }>> {
    return apiClient.get<{ items: InspectionActionDTO[]; total: number }>('/operations/actions', {
      params,
    });
  },

  /**
   * Retrieves single inspection action by ID
   */
  async getInspectionAction(actionId: string): Promise<ApiResponse<InspectionActionDTO>> {
    return apiClient.get<InspectionActionDTO>(`/operations/actions/${encodeURIComponent(actionId)}`);
  },

  /**
   * Assigns an open or assigned action
   */
  async assignInspectionAction(actionId: string, assignedTo: string, notes?: string): Promise<ApiResponse<InspectionActionDTO>> {
    return apiClient.post<InspectionActionDTO>(`/operations/actions/${encodeURIComponent(actionId)}/assign`, {
      assignedTo,
      notes,
    });
  },

  /**
   * Starts work on an assigned action
   */
  async startInspectionAction(actionId: string, notes?: string): Promise<ApiResponse<InspectionActionDTO>> {
    return apiClient.post<InspectionActionDTO>(`/operations/actions/${encodeURIComponent(actionId)}/start`, {
      notes,
    });
  },

  /**
   * Completes an in-progress action
   */
  async completeInspectionAction(actionId: string, completionNotes: string): Promise<ApiResponse<InspectionActionDTO>> {
    return apiClient.post<InspectionActionDTO>(`/operations/actions/${encodeURIComponent(actionId)}/complete`, {
      completionNotes,
    });
  },

  /**
   * Cancels a non-terminal action
   */
  async cancelInspectionAction(actionId: string, cancellationReason: string): Promise<ApiResponse<InspectionActionDTO>> {
    return apiClient.post<InspectionActionDTO>(`/operations/actions/${encodeURIComponent(actionId)}/cancel`, {
      cancellationReason,
    });
  },
};



