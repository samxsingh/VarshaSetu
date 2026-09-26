import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICalibrationReport {
  method: 'PLATT' | 'ISOTONIC' | 'RAW';
  ece: number; // Expected Calibration Error (e.g. 0.038)
  brierScore: number;
  reliabilityBins: Array<{
    bin: number;
    predictedMean: number;
    observedFrequency: number;
    sampleCount: number;
  }>;
}

export interface IValidationMetrics {
  testPeriod: string;
  brierSkillScore: number;
  rocAuc: number;
  sampleSize: number;
  folds: Array<{ foldNumber: number; testYear: number; bss: number; ece: number }>;
}

export interface IScientificModel extends Document {
  modelId: string;
  target: string;
  horizonDays: number;
  architecture: string;
  hyperparameters: Record<string, unknown>;
  calibration: ICalibrationReport;
  validation: IValidationMetrics;
  status: 'ACTIVE' | 'TRAINING' | 'DEPRECATED' | 'BENCHMARK_ONLY';
  isProductionGatePassed: boolean;
  trainedAt: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ReliabilityBinSchema = new Schema(
  {
    bin: { type: Number, required: true },
    predictedMean: { type: Number, required: true },
    observedFrequency: { type: Number, required: true },
    sampleCount: { type: Number, required: true },
  },
  { _id: false }
);

const CalibrationReportSchema = new Schema(
  {
    method: { type: String, enum: ['PLATT', 'ISOTONIC', 'RAW'], default: 'ISOTONIC' },
    ece: { type: Number, required: true },
    brierScore: { type: Number, required: true },
    reliabilityBins: { type: [ReliabilityBinSchema], default: [] },
  },
  { _id: false }
);

const FoldMetricSchema = new Schema(
  {
    foldNumber: { type: Number, required: true },
    testYear: { type: Number, required: true },
    bss: { type: Number, required: true },
    ece: { type: Number, required: true },
  },
  { _id: false }
);

const ValidationMetricsSchema = new Schema(
  {
    testPeriod: { type: String, default: '2014-2024' },
    brierSkillScore: { type: Number, required: true },
    rocAuc: { type: Number, required: true },
    sampleSize: { type: Number, required: true },
    folds: { type: [FoldMetricSchema], default: [] },
  },
  { _id: false }
);

const ScientificModelSchema = new Schema<IScientificModel>(
  {
    modelId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    target: {
      type: String,
      required: true,
      index: true,
    },
    horizonDays: {
      type: Number,
      required: true,
      enum: [7, 14, 21, 30],
      index: true,
    },
    architecture: {
      type: String,
      required: true,
      default: 'LightGBM Gradient Boosted Decision Forest + Temporal Attention',
    },
    hyperparameters: {
      type: Schema.Types.Mixed,
      default: {},
    },
    calibration: {
      type: CalibrationReportSchema,
      required: true,
    },
    validation: {
      type: ValidationMetricsSchema,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['ACTIVE', 'TRAINING', 'DEPRECATED', 'BENCHMARK_ONLY'],
      default: 'ACTIVE',
      index: true,
    },
    isProductionGatePassed: {
      type: Boolean,
      required: true,
      default: true,
    },
    trainedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'models',
  }
);

export const ScientificModel: Model<IScientificModel> =
  mongoose.models.ScientificModel || mongoose.model<IScientificModel>('ScientificModel', ScientificModelSchema);
