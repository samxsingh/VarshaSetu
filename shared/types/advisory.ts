/**
 * VarshaSetu - Agricultural Advisory & What-If Decision Simulation Types
 * Converts probabilistic climate/weather signals into crop-specific agronomic advice.
 */

import { DataMode } from './core';
import { ForecastLocationRef } from './forecast';

export type CropType =
  | 'PADDY'
  | 'MAIZE'
  | 'SOYBEAN'
  | 'PULSES'
  | 'COTTON'
  | 'GROUNDNUT'
  | 'MILLETS';

export type CropGrowthStage =
  | 'LAND_PREPARATION'
  | 'NURSERY_SOWING'
  | 'VEGETATIVE'
  | 'FLOWERING_REPRODUCTIVE'
  | 'GRAIN_POD_FILLING'
  | 'MATURITY_HARVESTING';

export type IrrigationFacility = 'RAINFED' | 'CANAL' | 'TUBEWELL' | 'DRIP_SPRINKLER' | 'MIXED';

export type SoilType = 'ALLUVIAL' | 'BLACK_COTTON' | 'RED_LATERITE' | 'SANDY_LOAM' | 'CLAY';

export type AdvisoryActionUrgency = 'INFO' | 'PREPARE' | 'ACTION_REQUIRED' | 'CRITICAL_ALERT';

export interface FarmerCropContext {
  crop: CropType;
  variety?: string;
  stage: CropGrowthStage;
  sowingDate?: string;
  irrigation: IrrigationFacility;
  soil: SoilType;
  farmSizeAcres?: number;
}

export interface AgronomicRuleMatch {
  ruleId: string;
  category: 'SOWING' | 'IRRIGATION' | 'PEST_DISEASE' | 'FERTILIZER' | 'DRAINAGE_HARVEST';
  matchedConditions: string[];
  rationale: string; // Scientific/agronomic rule reasoning
}

export interface CropAdvisoryRecord {
  id: string;
  location: ForecastLocationRef;
  farmerContext: FarmerCropContext;
  issuedAt: string;
  validUntil: string;
  urgency: AdvisoryActionUrgency;
  
  // Clean, high-impact headline for farmers
  headline: string;
  
  // Specific action items
  recommendations: {
    title: string;
    action: string;
    agronomicReasoning: string; // Explainable logic behind the recommendation
    doThis: string[];
    avoidThis: string[];
  }[];

  // Specific risk warnings
  riskWarnings: {
    type: 'FALSE_ONSET' | 'PROLONGED_DRY_SPELL' | 'WATERLOGGING_HEAVY_RAIN' | 'PEST_OUTBREAK';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    warningText: string;
    mitigationAction: string;
  }[];

  ruleMatches: AgronomicRuleMatch[];
  dataMode: DataMode;
}

// What-If Decision Simulator Contracts
export type SimulationScenarioType =
  | 'SOWING_DATE_COMPARISON'   // "Sow Now" vs "Wait 7 Days" vs "Wait 14 Days"
  | 'IRRIGATION_DECISION'       // "Irrigate Now" vs "Wait For Rains"
  | 'CROP_SELECTION_COMPARISON'; // "Crop A" vs "Crop B" under projected season

export interface WhatIfScenarioRequest {
  locationId: string;
  currentContext: FarmerCropContext;
  scenarioType: SimulationScenarioType;
  optionsToCompare: {
    label: string;
    parameterOverrides: Partial<FarmerCropContext> & {
      sowingOffsetDays?: number;
      irrigationAction?: 'IRRIGATE_NOW' | 'HOLD_OFF';
      alternateCrop?: CropType;
    };
  }[];
}

export interface ScenarioEvaluationResult {
  optionLabel: string;
  riskScore: number; // 0.0 (safest) to 1.0 (highest risk)
  primaryRisks: string[];
  expectedAdvantages: string[];
  waterStressRiskPercent: number;
  waterloggingRiskPercent: number;
  overallSuitability: 'RECOMMENDED' | 'ACCEPTABLE_WITH_RISK' | 'HIGH_RISK_NOT_RECOMMENDED';
  explanation: string;
}

export interface WhatIfSimulationResponse {
  id: string;
  scenarioType: SimulationScenarioType;
  evaluatedAt: string;
  disclaimer: string; // "Model-based agronomic estimate for advisory purposes, not a yield or weather guarantee."
  comparison: ScenarioEvaluationResult[];
  recommendedOption: string;
  decisionReasoning: string;
  dataMode: DataMode;
}
