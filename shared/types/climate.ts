/**
 * VarshaSetu - Large-Scale Climate Signals & Regional Atmospheric Types
 * Captures ENSO, IOD, MJO and regional weather variables.
 */

export type EnsoPhase = 'EL_NINO' | 'LA_NINA' | 'NEUTRAL';
export type IodPhase = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export interface ClimateSignalsObservation {
  id: string;
  observationDate: string; // ISO date
  
  // El Niño Southern Oscillation (ENSO)
  enso: {
    nino34Index: number; // Sea surface temperature anomaly in Niño 3.4 region (°C)
    oni: number; // Oceanic Niño Index
    phase: EnsoPhase;
    confidence: number; // 0.0 to 1.0
  };

  // Indian Ocean Dipole (IOD)
  iod: {
    dmiIndex: number; // Dipole Mode Index (°C)
    phase: IodPhase;
    confidence: number;
  };

  // Madden-Julian Oscillation (MJO)
  mjo: {
    phase: number; // Phases 1 to 8 (Real-time Multivariate MJO - RMM)
    amplitude: number; // Amplitude (>1 indicates active convection)
    rmm1: number;
    rmm2: number;
  };

  // Regional Variables
  regionalAtmosphere?: {
    monsoonTroughPositionDegN?: number;
    tibetanHighIntensityGpm?: number;
    crossEquatorialFlowSpeedMps?: number;
    mascareneHighPressureHpa?: number;
    seaSurfaceTemperatureArabianSeaC?: number;
    seaSurfaceTemperatureBayOfBengalC?: number;
  };

  source: string;
  isSimulated: boolean;
}

export interface RegionalWeatherObservation {
  id: string;
  locationId: string;
  timestamp: string;
  rainfallMm: number;
  temperatureMaxC: number;
  temperatureMinC: number;
  relativeHumidityPercent: number;
  windSpeedKmh: number;
  windDirectionDegrees: number;
  surfacePressureHpa: number;
  soilMoistureIndex?: number; // 0.0 - 1.0
  solarRadiationWpm2?: number;
  isSimulated: boolean;
}
