/**
 * VarshaSetu - Core Shared Types
 * Common primitives, standard API envelopes, status codes, and data provenance.
 */

export type DataMode = 'REAL' | 'DEMO';

export type IngestionStatus = 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';

export type FreshnessStatus = 'FRESH' | 'AGING' | 'STALE' | 'UNAVAILABLE';

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    dataMode: DataMode;
    pagination?: PaginationMeta;
    [key: string]: unknown;
  };
}

export interface ApiErrorDetail {
  field?: string;
  issue: string;
  received?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[] | Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

export interface DataProvenance {
  sourceId: string;
  sourceName: string;
  sourceTimestamp: string;
  ingestedAt: string;
  modelVersion?: string;
  dataMode: DataMode;
  isSimulated: boolean;
}
