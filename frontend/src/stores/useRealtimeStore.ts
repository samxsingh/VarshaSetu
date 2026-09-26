import { create } from 'zustand';
import { OperationalSignalDTO, InspectionActionDTO } from '../services/operationalService';

export type RealtimeConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'ERROR';

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
  isRead?: boolean;
}

export interface DataHealthUpdatedDTO {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'NO_DATA';
  datasetName?: string;
  recordsProcessed?: number;
  lastSyncTime: string;
  message?: string;
}

interface RealtimeState {
  connectionStatus: RealtimeConnectionStatus;
  lastConnectedAt: string | null;
  lastEventAt: string | null;
  unreadEventCount: number;
  recentEvents: ScientificEventDTO[];
  recentNotifications: InAppNotificationDTO[];
  recentForecastUpdates: ForecastUpdatedDTO[];
  latestDataHealth: DataHealthUpdatedDTO | null;
  operationalSignals: OperationalSignalDTO[];
  inspectionActions: InspectionActionDTO[];
  connectionError: string | null;
  commandCenterStale: boolean;
  commandCenterLastInvalidatedAt: string | null;

  setConnectionStatus: (status: RealtimeConnectionStatus, error?: string | null) => void;
  addEvent: (event: ScientificEventDTO) => void;
  updateEvent: (event: ScientificEventDTO) => void;
  addNotification: (notification: InAppNotificationDTO) => void;
  addForecastUpdate: (forecast: ForecastUpdatedDTO) => void;
  setDataHealth: (health: DataHealthUpdatedDTO) => void;
  addOperationalSignal: (signal: OperationalSignalDTO) => void;
  clearOperationalSignals: () => void;
  addOrUpdateInspectionAction: (action: InspectionActionDTO) => void;
  clearInspectionActions: () => void;
  markNotificationsRead: () => void;
  clearEvents: () => void;
  invalidateCommandCenter: () => void;
  markCommandCenterFresh: () => void;
}

const MAX_RECENT_EVENTS = 50;
const MAX_RECENT_NOTIFICATIONS = 30;
const MAX_RECENT_FORECASTS = 20;
const MAX_RECENT_SIGNALS = 50;
const MAX_RECENT_ACTIONS = 50;


export const useRealtimeStore = create<RealtimeState>((set) => ({
  connectionStatus: 'DISCONNECTED',
  lastConnectedAt: null,
  lastEventAt: null,
  unreadEventCount: 0,
  recentEvents: [],
  recentNotifications: [],
  recentForecastUpdates: [],
  latestDataHealth: null,
  operationalSignals: [],
  inspectionActions: [],
  connectionError: null,
  commandCenterStale: false,
  commandCenterLastInvalidatedAt: null,

  setConnectionStatus: (status, error = null) => {
    set((state) => ({
      connectionStatus: status,
      connectionError: error,
      lastConnectedAt: status === 'CONNECTED' ? new Date().toISOString() : state.lastConnectedAt,
    }));
  },

  addEvent: (event) => {
    set((state) => {
      // Deduplicate: check if event with identical eventId or deduplicationHash already exists
      const existingIndex = state.recentEvents.findIndex(
        (e) => e.eventId === event.eventId || (e.deduplicationHash && e.deduplicationHash === event.deduplicationHash)
      );

      let updatedList: ScientificEventDTO[];
      if (existingIndex >= 0) {
        // Replace existing item with updated snapshot
        updatedList = [...state.recentEvents];
        updatedList[existingIndex] = event;
      } else {
        // Prepend new event
        updatedList = [event, ...state.recentEvents].slice(0, MAX_RECENT_EVENTS);
      }

      return {
        recentEvents: updatedList,
        lastEventAt: new Date().toISOString(),
        unreadEventCount: state.unreadEventCount + (existingIndex < 0 ? 1 : 0),
      };
    });
  },

  updateEvent: (event) => {
    set((state) => {
      const existingIndex = state.recentEvents.findIndex(
        (e) => e.eventId === event.eventId || (e.deduplicationHash && e.deduplicationHash === event.deduplicationHash)
      );

      let updatedList: ScientificEventDTO[];
      if (existingIndex >= 0) {
        updatedList = [...state.recentEvents];
        updatedList[existingIndex] = event;
      } else {
        updatedList = [event, ...state.recentEvents].slice(0, MAX_RECENT_EVENTS);
      }

      return {
        recentEvents: updatedList,
        lastEventAt: new Date().toISOString(),
      };
    });
  },

  addNotification: (notification) => {
    set((state) => {
      // Deduplicate on id / deliveryId
      const exists = state.recentNotifications.some(
        (n) => n.id === notification.id || n.deliveryId === notification.deliveryId
      );
      if (exists) {
        return state;
      }

      const updated = [{ ...notification, isRead: false }, ...state.recentNotifications].slice(
        0,
        MAX_RECENT_NOTIFICATIONS
      );

      return {
        recentNotifications: updated,
        unreadEventCount: state.unreadEventCount + 1,
        lastEventAt: new Date().toISOString(),
      };
    });
  },

  addForecastUpdate: (forecast) => {
    set((state) => {
      const filtered = state.recentForecastUpdates.filter(
        (f) => !(f.forecastId === forecast.forecastId && f.blockId === forecast.blockId)
      );
      return {
        recentForecastUpdates: [forecast, ...filtered].slice(0, MAX_RECENT_FORECASTS),
        lastEventAt: new Date().toISOString(),
      };
    });
  },

  setDataHealth: (health) => {
    set({
      latestDataHealth: health,
      lastEventAt: new Date().toISOString(),
    });
  },

  addOperationalSignal: (signal) => {
    set((state) => {
      const existingIndex = state.operationalSignals.findIndex(
        (s) => s.signalId === signal.signalId
      );

      let updatedList: OperationalSignalDTO[];
      if (existingIndex >= 0) {
        updatedList = [...state.operationalSignals];
        updatedList[existingIndex] = signal;
      } else {
        updatedList = [signal, ...state.operationalSignals].slice(0, MAX_RECENT_SIGNALS);
      }

      return {
        operationalSignals: updatedList,
        lastEventAt: new Date().toISOString(),
        commandCenterStale: true,
        commandCenterLastInvalidatedAt: new Date().toISOString(),
      };
    });
  },

  clearOperationalSignals: () => {
    set({
      operationalSignals: [],
    });
  },

  addOrUpdateInspectionAction: (action) => {
    set((state) => {
      const existingIndex = state.inspectionActions.findIndex(
        (a) => a.actionId === action.actionId
      );

      let updatedList: InspectionActionDTO[];
      if (existingIndex >= 0) {
        updatedList = [...state.inspectionActions];
        updatedList[existingIndex] = action;
      } else {
        updatedList = [action, ...state.inspectionActions].slice(0, MAX_RECENT_ACTIONS);
      }

      return {
        inspectionActions: updatedList,
        lastEventAt: new Date().toISOString(),
        commandCenterStale: true,
        commandCenterLastInvalidatedAt: new Date().toISOString(),
      };
    });
  },

  clearInspectionActions: () => {
    set({
      inspectionActions: [],
    });
  },

  markNotificationsRead: () => {
    set((state) => ({
      unreadEventCount: 0,
      recentNotifications: state.recentNotifications.map((n) => ({ ...n, isRead: true })),
    }));
  },

  clearEvents: () => {
    set({
      recentEvents: [],
      recentNotifications: [],
      unreadEventCount: 0,
    });
  },

  invalidateCommandCenter: () => {
    set({
      commandCenterStale: true,
      commandCenterLastInvalidatedAt: new Date().toISOString(),
    });
  },

  markCommandCenterFresh: () => {
    set({
      commandCenterStale: false,
    });
  },
}));
