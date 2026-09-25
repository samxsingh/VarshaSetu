import { request } from './apiClient';
import { ApiResponse } from '@shared/types';

export interface ScientificEventItem {
  event_id: string;
  event_type: string;
  forecast_id: string;
  block_id: string;
  detected_at: string;
  valid_from: string;
  valid_until: string;
  probability: number;
  threshold: number;
  unit: string;
  severity: 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';
  confidence_status: string;
  operational_status: string;
  data_freshness: string;
  validation_status: string;
  explanation_reference?: string | null;
  state: 'DETECTED' | 'ACKNOWLEDGED' | 'UPDATED' | 'RESOLVED' | 'EXPIRED' | 'SUPPRESSED';
  description: string;
  deduplication_hash: string;
  updated_at: string;
  acknowledged_by?: string | null;
  acknowledged_at?: string | null;
  resolved_by?: string | null;
  resolved_at?: string | null;
  metadata?: Record<string, any>;
}

export interface EventTransitionItem {
  transition_id: string;
  event_id: string;
  previous_state: string;
  new_state: string;
  actor: string;
  timestamp: string;
  reason: string;
  metadata?: Record<string, any>;
}

export interface EventListResponse {
  total_events: number;
  events: ScientificEventItem[];
}

export interface EventDetectionPayload {
  block_id?: string;
  target_types?: string[];
  cooldown_hours?: number;
}

export interface EventDetectionResponse {
  total_evaluated_forecasts: number;
  detected_events: ScientificEventItem[];
  updated_events: ScientificEventItem[];
  suppressed_count: number;
  operational_status: string;
  timestamp: string;
  summary: string;
}

export interface NotificationStatusResponse {
  subsystem: string;
  phase: string;
  mode: string;
  active_channels: string[];
  disabled_external_channels: string[];
  external_channels_status: string;
  audit_storage: string;
  scientific_disclosure: string;
}

export interface NotificationPreferences {
  user_id: string;
  role: string;
  preferred_language: string;
  event_types: string[];
  minimum_severity: string;
  enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  channels: string[];
}

export interface OperationalStatusResponse {
  forecast_service_status: string;
  model_registry_status: string;
  data_freshness_status: string;
  calibration_status: string;
  validation_status: string;
  event_engine_status: string;
  delivery_status: string;
  database_status: string;
  last_successful_forecast_generation: string | null;
  last_event_detection: string | null;
  last_expiry_run: string | null;
  total_active_forecasts: number;
  total_active_events: number;
  active_dataset: string;
  spatial_extent: string;
  timestamp: string;
  scientific_disclosures: string[];
}

export interface ProcessExpiryResponse {
  processed_count: number;
  expired_count: number;
  expired_forecast_ids: string[];
  timestamp: string;
  message: string;
}

export const eventService = {
  async listEvents(params: {
    block_id?: string;
    event_type?: string;
    severity?: string;
    state?: string;
    limit?: number;
  } = {}): Promise<ApiResponse<EventListResponse>> {
    const query = new URLSearchParams();
    if (params.block_id) query.append('block_id', params.block_id);
    if (params.event_type) query.append('event_type', params.event_type);
    if (params.severity) query.append('severity', params.severity);
    if (params.state) query.append('state', params.state);
    if (params.limit) query.append('limit', String(params.limit));

    const qs = query.toString();
    const endpoint = qs ? `/events?${qs}` : '/events';
    return request<EventListResponse>(endpoint);
  },

  async getEventById(eventId: string): Promise<ApiResponse<ScientificEventItem>> {
    return request<ScientificEventItem>(`/events/${encodeURIComponent(eventId)}`);
  },

  async getEventHistory(eventId: string): Promise<ApiResponse<{ event_id: string; history: EventTransitionItem[] }>> {
    return request<{ event_id: string; history: EventTransitionItem[] }>(`/events/${encodeURIComponent(eventId)}/history`);
  },

  async detectEvents(payload: EventDetectionPayload = {}): Promise<ApiResponse<EventDetectionResponse>> {
    return request<EventDetectionResponse>('/events/detect', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async acknowledgeEvent(eventId: string, reason = 'Acknowledged by duty officer'): Promise<ApiResponse<ScientificEventItem>> {
    return request<ScientificEventItem>(`/events/${encodeURIComponent(eventId)}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async resolveEvent(eventId: string, reason = 'Risk period resolved'): Promise<ApiResponse<ScientificEventItem>> {
    return request<ScientificEventItem>(`/events/${encodeURIComponent(eventId)}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async getNotificationStatus(): Promise<ApiResponse<NotificationStatusResponse>> {
    return request<NotificationStatusResponse>('/notifications/status');
  },

  async getNotificationPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return request<NotificationPreferences>('/notifications/preferences');
  },

  async updateNotificationPreferences(prefs: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> {
    return request<NotificationPreferences>('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
  },

  async getOperationsStatus(): Promise<ApiResponse<OperationalStatusResponse>> {
    return request<OperationalStatusResponse>('/operations/status');
  },

  async processForecastExpiry(): Promise<ApiResponse<ProcessExpiryResponse>> {
    return request<ProcessExpiryResponse>('/forecasts/process-expiry', {
      method: 'POST',
    });
  },

  // Aliases for convenience
  async getEvents(params: {
    block_id?: string;
    event_type?: string;
    severity?: string;
    state?: string;
    limit?: number;
    horizon_days?: number;
  } = {}): Promise<ApiResponse<EventListResponse>> {
    return this.listEvents(params);
  },

  async getOperationalStatus(): Promise<ApiResponse<OperationalStatusResponse>> {
    return this.getOperationsStatus();
  },

  async processExpiry(): Promise<ApiResponse<ProcessExpiryResponse>> {
    return this.processForecastExpiry();
  },
};

export type ForecastEvent = ScientificEventItem;

