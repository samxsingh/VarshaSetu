/**
 * VarshaSetu - Probabilistic Forecast Types
 * Covers Onset, Dry Spell / Break Monsoon, Heavy Rain, and Rainfall Anomaly.
 */

import { DataMode, DataProvenance } from './core';
import { AdministrativeLevel, Coordinates } from './geography';

export type ForecastTarget =
  | 'MONSOON_ONSET'
  | 'DRY_SPELL_BREAK'
  | 'HEAVY_RAIN'
  | 'RAINFALL_ANOMALY';

export type ForecastHorizonDays = 7 | 14 | 21 | 30;

export type RainfallAnomalyCategory =
  | 'LARGE_DEFICIT' // < -60%
  | 'DEFICIT'       // -59% to -20%
  | 'NORMAL'        // -19% to +19%
  | 'EXCESS'        // +20% to +59%
  | 'LARGE_EXCESS'; // >= +60%

export interface ForecastLocationRef {
  id: string;
  name: string;
  level: AdministrativeLevel;
  state: string;
  district: string;
  block?: string;
  panchayat?: string;
  centerCoordinates: Coordinates;
}

export interface ProbabilisticOutlook {
  target: ForecastTarget;
  horizonDays: ForecastHorizonDays;
  probability: number; // Stored strictly between 0.0 and 1.0 (presentation converts to %)
  confidence: number; // 0.0 to 1.0
  uncertaintyMargin: number; // e.g., ± 0.08
  climatologicalBaselineProbability: number; // Historical frequency baseline for evaluation
  
  // Specific contextual attributes based on target
  targetMetadata?: {
    // For MONSOON_ONSET
    predictedOnsetWindowStart?: string;
    predictedOnsetWindowEnd?: string;
    falseOnsetRiskProbability?: number; // Probability of premature surge followed by immediate dry hiatus
    
    // For DRY_SPELL_BREAK
    drySpellDurationDays?: number;
    revivalExpectedDate?: string;
    consecutiveDryDaysThreshold?: number; // e.g., >= 5 or 7 days with rain < 2.5mm
    
    // For HEAVY_RAIN
    thresholdMmPer24h?: number; // e.g., >= 64.5mm (IMD heavy rain definition)
    peakIntensityExpectedDate?: string;
    
    // For RAINFALL_ANOMALY
    anomalyCategory?: RainfallAnomalyCategory;
    expectedRainfallMm?: number;
    normalRainfallMm?: number;
    percentageDeparture?: number;
  };

  // Primary driving factors (scientific explainability)
  primaryDrivers: {
    factor: string;
    influence: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    description: string;
  }[];
}

export interface HyperlocalForecastRecord {
  id: string;
  location: ForecastLocationRef;
  issueTimestamp: string;
  validFrom: string;
  validUntil: string;
  underlyingDataTimestamp: string;
  modelVersion: string;
  dataMode: DataMode;
  provenance: DataProvenance;
  
  // Probabilistic outlooks across targets and horizons
  outlooks: ProbabilisticOutlook[];

  // High-level farmer-friendly synthesis summary
  farmerSummary: {
    headline: string;
    advisorySnippet: string;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  };
}
