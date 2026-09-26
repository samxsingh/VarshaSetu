import { UserRole, PermissionScope } from '@shared/types';

export interface AuthenticatedSocketUser {
  userId: string;
  role: UserRole;
  permissions: PermissionScope[];
  assignedLocationId?: string;
}

export type EventSeverity = 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';
export type EventState =
  | 'DETECTED'
  | 'ACKNOWLEDGED'
  | 'UPDATED'
  | 'RESOLVED'
  | 'EXPIRED'
  | 'SUPPRESSED';

export interface ScientificEventDTO {
  eventId: string;
  eventType: string;
  forecastId: string;
  blockId: string;
  detectedAt: string;
  validFrom: string;
  validUntil: string;
  probability: number;
  threshold: number;
  unit: string;
  severity: EventSeverity;
  confidenceStatus: string;
  operationalStatus: string;
  dataFreshness: string;
  validationStatus: string;
  explanationReference?: string | null;
  state: EventState;
  description: string;
  deduplicationHash: string;
  acknowledgedBy?: string | null;
  acknowledgedAt?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  metadata?: Record<string, unknown>;
}

export interface ForecastUpdatedDTO {
  forecastId: string;
  blockId: string;
  targetType: string;
  horizonDays: number;
  validFrom: string;
  validUntil: string;
  probability: number | null;
  predictedValue?: number | null;
  unit?: string;
  severity?: EventSeverity;
  confidenceStatus: string;
  operationalStatus: string;
  dataFreshness: string;
  modelId: string;
  modelVersion: string;
  generatedAt: string;
}

export interface AdvisoryUpdatedDTO {
  advisoryId: string;
  blockId: string;
  cropType: string;
  severity: EventSeverity;
  status: 'ACTIVE' | 'DISMISSED';
  headline: string;
  updatedAt: string;
}

export interface DataHealthUpdatedDTO {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'NO_DATA';
  datasetName?: string;
  recordsProcessed?: number;
  lastSyncTime: string;
  message?: string;
}

export interface InAppNotificationDTO {
  id: string;
  deliveryId: string;
  userId: string;
  title: string;
  body: string;
  severity: EventSeverity;
  channel: 'IN_APP';
  status: 'DELIVERED';
  timestamp: string;
  eventId?: string;
  metadata?: Record<string, unknown>;
}

export interface SystemAnnouncementDTO {
  id: string;
  title: string;
  message: string;
  level: 'INFO' | 'WARNING' | 'MAINTENANCE';
  timestamp: string;
}

export interface ServerToClientEvents {
  'event:created': (event: ScientificEventDTO) => void;
  'event:updated': (event: ScientificEventDTO) => void;
  'event:acknowledged': (event: ScientificEventDTO) => void;
  'event:resolved': (event: ScientificEventDTO) => void;
  'event:expired': (event: ScientificEventDTO) => void;
  'forecast:updated': (forecast: ForecastUpdatedDTO) => void;
  'advisory:updated': (advisory: AdvisoryUpdatedDTO) => void;
  'data_health:updated': (health: DataHealthUpdatedDTO) => void;
  'notification:received': (notification: InAppNotificationDTO) => void;
  'system:announcement': (announcement: SystemAnnouncementDTO) => void;
  'room:joined': (data: { room: string; timestamp: string }) => void;
  'room:left': (data: { room: string; timestamp: string }) => void;
  'room:error': (data: { room: string; error: string }) => void;
}

export interface ClientToServerEvents {
  'room:join': (room: string, callback?: (response: { success: boolean; room: string; error?: string }) => void) => void;
  'room:leave': (room: string, callback?: (response: { success: boolean; room: string }) => void) => void;
  'ping:health': (callback: (response: { status: string; timestamp: string; role: UserRole }) => void) => void;
}

export interface SocketData {
  user: AuthenticatedSocketUser;
}
