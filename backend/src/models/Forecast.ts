import mongoose, { Schema, Document, Model } from 'mongoose';

export type ForecastTarget =
  | 'HEAVY_RAIN'
  | 'DRY_SPELL'
  | 'MONSOON_ONSET'
  | 'FALSE_ONSET'
  | 'RAINFALL_ANOMALY';

export type ConfidenceTier = 'HIGH' | 'MEDIUM' | 'LOW';
export type OperationalStatus = 'DIAGNOSTIC_ONLY' | 'OPERATIONAL' | 'SHADOW';
export type DataFreshness = 'REALTIME' | 'ARCHIVED' | 'SYNTHETIC_DEMO';
export type ValidationStatus = 'VALIDATED' | 'PROVISIONAL' | 'INSUFFICIENT_DATA';

export interface IUncertaintySpread {
  p10: number | null;
  p50: number | null;
  p90: number | null;
}

export interface IClimatologyReference {
  normalValue: number | null;
  deviationPct: number | null;
  baselineYears: string;
}

export interface IForecast extends Document {
  forecastId: string;
  locationId?: mongoose.Types.ObjectId;
  blockCode: string;
  targetType: ForecastTarget;
  targetUnit: string;
  threshold: number;
  horizonDays: 3 | 7 | 14 | 21 | 30;
  validFrom: Date;
  validUntil: Date;
  probability: number; // Calibrated probability [0.0, 1.0]
  confidenceTier: ConfidenceTier;
  uncertainty: IUncertaintySpread;
  climatology: IClimatologyReference;
  operationalStatus: OperationalStatus;
  dataFreshness: DataFreshness;
  validationStatus: ValidationStatus;
  provenanceId?: mongoose.Types.ObjectId;
  runId?: mongoose.Types.ObjectId;
  scientificDisclaimer: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const UncertaintySchema = new Schema(
  {
    p10: { type: Number, default: null },
    p50: { type: Number, default: null },
    p90: { type: Number, default: null },
  },
  { _id: false }
);

const ClimatologySchema = new Schema(
  {
    normalValue: { type: Number, default: null },
    deviationPct: { type: Number, default: null },
    baselineYears: { type: String, default: '2014-2024' },
  },
  { _id: false }
);

const ForecastSchema = new Schema<IForecast>(
  {
    forecastId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Geography',
      default: null,
      index: true,
    },
    blockCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    targetType: {
      type: String,
      required: true,
      enum: ['HEAVY_RAIN', 'DRY_SPELL', 'MONSOON_ONSET', 'FALSE_ONSET', 'RAINFALL_ANOMALY'],
      index: true,
    },
    targetUnit: {
      type: String,
      required: true,
      default: 'mm',
    },
    threshold: {
      type: Number,
      required: true,
    },
    horizonDays: {
      type: Number,
      required: true,
      enum: [3, 7, 14, 21, 30],
      default: 7,
      index: true,
    },
    validFrom: {
      type: Date,
      required: true,
      index: true,
    },
    validUntil: {
      type: Date,
      required: true,
      index: true,
    },
    probability: {
      type: Number,
      required: true,
      min: 0.0,
      max: 1.0,
    },
    confidenceTier: {
      type: String,
      required: true,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
    uncertainty: {
      type: UncertaintySchema,
      default: () => ({ p10: null, p50: null, p90: null }),
    },
    climatology: {
      type: ClimatologySchema,
      default: () => ({ normalValue: null, deviationPct: null, baselineYears: '2014-2024' }),
    },
    operationalStatus: {
      type: String,
      required: true,
      enum: ['DIAGNOSTIC_ONLY', 'OPERATIONAL', 'SHADOW'],
      default: 'DIAGNOSTIC_ONLY',
    },
    dataFreshness: {
      type: String,
      required: true,
      enum: ['REALTIME', 'ARCHIVED', 'SYNTHETIC_DEMO'],
      default: 'ARCHIVED',
    },
    validationStatus: {
      type: String,
      required: true,
      enum: ['VALIDATED', 'PROVISIONAL', 'INSUFFICIENT_DATA'],
      default: 'PROVISIONAL',
    },
    provenanceId: {
      type: Schema.Types.ObjectId,
      ref: 'Provenance',
      default: null,
    },
    runId: {
      type: Schema.Types.ObjectId,
      ref: 'ForecastRun',
      default: null,
    },
    scientificDisclaimer: {
      type: String,
      default:
        'Diagnostic probabilistic indicators indicate statistical likelihood, not guaranteed meteorological certainty. Ground operational decisions according to verified IMD protocols.',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'forecasts',
  }
);

// Compound queries: fast block + horizon lookups
ForecastSchema.index({ blockCode: 1, horizonDays: 1, validFrom: -1 });
ForecastSchema.index({ targetType: 1, validFrom: 1, validUntil: 1 });

export const Forecast: Model<IForecast> =
  mongoose.models.Forecast || mongoose.model<IForecast>('Forecast', ForecastSchema);
