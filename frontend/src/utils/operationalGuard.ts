/**
 * VarshaSetu Operational Guard & Temporal Integrity Utility (Phase 13)
 * Enforces strict data-layer separation and guards against stale, historical, or simulated
 * data leakage into operational views.
 *
 * Core Principle:
 * ONE OPERATIONAL TIME CONTEXT
 * -> ONE CANONICAL DATA LAYER
 * -> NO STALE DATA LEAKAGE
 * -> EXPLICIT HISTORICAL ISOLATION
 * -> PERSONA-SPECIFIC DECISION INTELLIGENCE
 */

import { useMemo } from 'react';

export type DataLayer = 'OPERATIONAL' | 'REFERENCE' | 'SIMULATION' | 'UNAVAILABLE';

export type FreshnessStatus = 'LIVE' | 'RECENT' | 'STALE' | 'HISTORICAL' | 'SIMULATED';

export interface GuardEvaluation {
  valid: boolean;
  detectedLayer: DataLayer;
  reason?: string;
}

/**
 * Validates whether a data payload conforms to the expected data layer.
 * Specifically prevents HISTORICAL or SIMULATED data from leaking into OPERATIONAL views.
 */
export function assertOperationalFreshness(
  data: any,
  expectedLayer: DataLayer = 'OPERATIONAL'
): GuardEvaluation {
  if (data === null || data === undefined) {
    return {
      valid: false,
      detectedLayer: 'UNAVAILABLE',
      reason: 'Payload is null or undefined (Data Unavailable)',
    };
  }

  // Extract freshness and layer attributes from various schema conventions
  const freshness: FreshnessStatus | undefined =
    data.freshnessStatus ||
    data.freshness_status ||
    data.data?.freshness_status ||
    data.freshness;

  const explicitMode: string | undefined =
    data.dataMode ||
    data.data_mode ||
    data.mode;

  // Check for simulation flags
  const isSimulation =
    freshness === 'SIMULATED' ||
    explicitMode === 'SIMULATION' ||
    data.isSimulated === true ||
    data.scientific_disclosure?.status === 'SIMULATION' ||
    data.scenario_id !== undefined;

  if (isSimulation) {
    if (expectedLayer === 'OPERATIONAL') {
      return {
        valid: false,
        detectedLayer: 'SIMULATION',
        reason: 'Simulated data cannot be rendered as operational without explicit simulation isolation.',
      };
    }
    return { valid: true, detectedLayer: 'SIMULATION' };
  }

  // Check for historical archive flags
  const isHistorical =
    freshness === 'HISTORICAL' ||
    freshness === ('HISTORICAL_ONLY' as any) ||
    explicitMode === 'HISTORICAL_REFERENCE' ||
    data.isHistorical === true ||
    data.scientific_disclosure?.status === 'HISTORICAL_ARCHIVE' ||
    (typeof data.dataset_name === 'string' && data.dataset_name.toLowerCase().includes('archive')) ||
    (typeof data.temporalCoverage === 'string' && data.temporalCoverage.toLowerCase().includes('benchmark'));

  if (isHistorical) {
    if (expectedLayer === 'OPERATIONAL') {
      return {
        valid: false,
        detectedLayer: 'REFERENCE',
        reason: 'Historical archive data cannot be rendered as primary operational forecast.',
      };
    }
    return { valid: true, detectedLayer: 'REFERENCE' };
  }

  // Operational Layer checks
  if (expectedLayer === 'OPERATIONAL') {
    // If freshness is explicit, it must be LIVE or RECENT (or acceptable STALE with degraded badge)
    if (freshness === 'STALE') {
      return {
        valid: true,
        detectedLayer: 'OPERATIONAL',
        reason: 'Data is STALE (>24 hours) - degraded operational state',
      };
    }

    return {
      valid: true,
      detectedLayer: 'OPERATIONAL',
    };
  }

  return {
    valid: true,
    detectedLayer: 'OPERATIONAL',
  };
}

/**
 * Convenience helper returning boolean for operational validity.
 */
export function isOperationalDataValid(data: any): boolean {
  return assertOperationalFreshness(data, 'OPERATIONAL').valid;
}

/**
 * Hook to guard any component against displaying invalid or mismatched data layers.
 */
export function useOperationalGuard<T>(
  data: T | null | undefined,
  expectedLayer: DataLayer = 'OPERATIONAL'
): {
  isValid: boolean;
  displayState: 'READY' | 'EMPTY' | 'REJECTED_STALE' | 'HISTORICAL_ISOLATED';
  detectedLayer: DataLayer;
  reason?: string;
  data: T | null;
} {
  return useMemo(() => {
    if (data === null || data === undefined) {
      return {
        isValid: false,
        displayState: 'EMPTY',
        detectedLayer: 'UNAVAILABLE',
        reason: 'No observations or forecasts available for this window.',
        data: null,
      };
    }

    const evaluation = assertOperationalFreshness(data, expectedLayer);

    if (!evaluation.valid) {
      return {
        isValid: false,
        displayState: evaluation.detectedLayer === 'REFERENCE' ? 'HISTORICAL_ISOLATED' : 'REJECTED_STALE',
        detectedLayer: evaluation.detectedLayer,
        reason: evaluation.reason,
        data: null,
      };
    }

    return {
      isValid: true,
      displayState: 'READY',
      detectedLayer: evaluation.detectedLayer,
      reason: evaluation.reason,
      data,
    };
  }, [data, expectedLayer]);
}

/**
 * Standard Asia/Kolkata (IST) Date-Time Formatter.
 * Part 14: All timestamps displayed to users MUST use Asia/Kolkata (IST).
 * Format: "DD MMM YYYY, HH:mm IST"
 */
export function formatISTDateTime(dateInput: string | Date | number | undefined | null): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const datePart = d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const timePart = d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return `${datePart}, ${timePart} IST`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Standard Asia/Kolkata (IST) Date Formatter.
 * Format: "DD MMM YYYY"
 */
export function formatISTDate(dateInput: string | Date | number | undefined | null): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateInput);
  }
}
