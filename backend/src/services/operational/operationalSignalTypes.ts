import { UserRole } from '@shared/types';

export type OperationalSignalType =
  | 'EVENT'
  | 'FORECAST_CHANGE'
  | 'ADVISORY'
  | 'DATA_QUALITY'
  | 'MODEL_STATUS'
  | 'OPERATIONAL_GATE';

export type SignalSeverity = 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';

export interface SignalSourceReference {
  id: string;
  type: string;
  label?: string;
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
  recommendedInspection: string;
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

export interface OperationalSignalContext {
  userId?: string;
  role?: UserRole;
  assignedLocationId?: string;
}

export interface OperationalLocationContext {
  blockId: string;
  blockName: string;
  districtName: string;
  stateName: string;
}

export type LocationContext = OperationalLocationContext;

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
  location: LocationContext;
  timing: TimingContext;
  scientific: ScientificContext;
  evidence: EvidenceContext;
  underlyingEntity: UnderlyingEntityContext;
  recommendedInspection: string;
  limitations: string[];
  nextInspections: NextInspectionAction[];
}
