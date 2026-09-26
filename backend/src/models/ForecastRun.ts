import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILifecycleTransition {
  transitionId: string;
  previousStatus: string;
  newStatus: string;
  actor: string;
  reason: string;
  timestamp: Date;
}

export interface IForecastRun extends Document {
  runId: string;
  modelVersion: string;
  datasetFingerprint: string;
  startedAt: Date;
  completedAt?: Date;
  executionDurationMs?: number;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';
  totalForecastsGenerated: number;
  transitions: ILifecycleTransition[];
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const LifecycleTransitionSchema = new Schema(
  {
    transitionId: { type: String, required: true },
    previousStatus: { type: String, required: true },
    newStatus: { type: String, required: true },
    actor: { type: String, required: true, default: 'SYSTEM' },
    reason: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const ForecastRunSchema = new Schema<IForecastRun>(
  {
    runId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    modelVersion: {
      type: String,
      required: true,
      default: '1.0.0',
    },
    datasetFingerprint: {
      type: String,
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    executionDurationMs: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED'],
      default: 'RUNNING',
      index: true,
    },
    totalForecastsGenerated: {
      type: Number,
      default: 0,
    },
    transitions: {
      type: [LifecycleTransitionSchema],
      default: [],
    },
    errorMessage: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'forecast_runs',
  }
);

export const ForecastRun: Model<IForecastRun> =
  mongoose.models.ForecastRun || mongoose.model<IForecastRun>('ForecastRun', ForecastRunSchema);
