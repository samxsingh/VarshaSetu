import mongoose, { Schema, Document, Model } from 'mongoose';

export type IngestionStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';
export type DataQualityFlag = 'GOOD' | 'WARNING' | 'BAD' | 'MISSING' | 'IMPUTED';

export interface IDataQualityReport {
  datasetName: string;
  totalRecords: number;
  validRecords: number;
  missingRecords: number;
  outlierRecords: number;
  qualityScore: number; // 0.0 to 1.0
  qualityFlag: DataQualityFlag;
  details?: Record<string, unknown>;
}

export interface IIngestionRun {
  runId: string;
  variable: string;
  startedAt: Date;
  completedAt?: Date;
  status: IngestionStatus;
  recordsProcessed: number;
  recordsFailed: number;
  qualityReport?: IDataQualityReport;
  processingVersion: string;
  errorMessage?: string;
  coverageStart?: Date;
  coverageEnd?: Date;
  spatialResolution?: string;
}

export interface IDataHealth extends Document {
  sourceId: string;
  provider: string; // e.g. IMD, ECMWF, NOAA, ISRO
  name: string;
  type: string;
  baseUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DEGRADED' | 'NOT_CONFIGURED';
  updateFrequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'STATIC_ARCHIVE';
  lastSuccessfulSync?: Date;
  latestQualityScore?: number;
  runs: IIngestionRun[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const DataQualityReportSchema = new Schema(
  {
    datasetName: { type: String, required: true },
    totalRecords: { type: Number, required: true },
    validRecords: { type: Number, required: true },
    missingRecords: { type: Number, required: true },
    outlierRecords: { type: Number, required: true },
    qualityScore: { type: Number, required: true, min: 0.0, max: 1.0 },
    qualityFlag: {
      type: String,
      enum: ['GOOD', 'WARNING', 'BAD', 'MISSING', 'IMPUTED'],
      default: 'GOOD',
    },
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const IngestionRunSchema = new Schema(
  {
    runId: { type: String, required: true },
    variable: { type: String, required: true },
    startedAt: { type: Date, required: true, default: Date.now },
    completedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED'],
      default: 'PENDING',
    },
    recordsProcessed: { type: Number, default: 0 },
    recordsFailed: { type: Number, default: 0 },
    qualityReport: { type: DataQualityReportSchema, default: null },
    processingVersion: { type: String, default: '1.0.0' },
    errorMessage: { type: String, default: null },
    coverageStart: { type: Date, default: null },
    coverageEnd: { type: Date, default: null },
    spatialResolution: { type: String, default: null },
  },
  { _id: false }
);

const DataHealthSchema = new Schema<IDataHealth>(
  {
    sourceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
    },
    baseUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ['ACTIVE', 'INACTIVE', 'DEGRADED', 'NOT_CONFIGURED'],
      default: 'ACTIVE',
      index: true,
    },
    updateFrequency: {
      type: String,
      enum: ['HOURLY', 'DAILY', 'WEEKLY', 'STATIC_ARCHIVE'],
      default: 'DAILY',
    },
    lastSuccessfulSync: {
      type: Date,
      default: null,
    },
    latestQualityScore: {
      type: Number,
      default: null,
      min: 0.0,
      max: 1.0,
    },
    runs: {
      type: [IngestionRunSchema],
      default: [],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'data_health',
  }
);

export const DataHealth: Model<IDataHealth> =
  mongoose.models.DataHealth || mongoose.model<IDataHealth>('DataHealth', DataHealthSchema);
