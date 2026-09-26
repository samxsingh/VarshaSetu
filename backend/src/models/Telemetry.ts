import mongoose, { Schema, Document, Model } from 'mongoose';

export type QualityFlag = 'GOOD' | 'SUSPECT' | 'MISSING' | 'IMPUTED';

export interface ITelemetry extends Document {
  stationId?: mongoose.Types.ObjectId;
  stationCode: string;
  observedAt: Date;
  rainfallMm: number | null;
  temperatureC: number | null;
  relativeHumidityPct: number | null;
  windSpeedKmh: number | null;
  windDirectionDeg: number | null;
  atmosphericPressureHpa: number | null;
  soilMoisturePct: number | null;
  qualityFlag: QualityFlag;
  rawPayload?: Record<string, unknown>;
  createdAt: Date;
}

const TelemetrySchema = new Schema<ITelemetry>(
  {
    stationId: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      default: null,
      index: true,
    },
    stationCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    observedAt: {
      type: Date,
      required: true,
      index: true,
    },
    rainfallMm: {
      type: Number,
      default: null,
      min: 0,
    },
    temperatureC: {
      type: Number,
      default: null,
      min: -50,
      max: 65,
    },
    relativeHumidityPct: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    windSpeedKmh: {
      type: Number,
      default: null,
      min: 0,
    },
    windDirectionDeg: {
      type: Number,
      default: null,
      min: 0,
      max: 360,
    },
    atmosphericPressureHpa: {
      type: Number,
      default: null,
      min: 800,
      max: 1100,
    },
    soilMoisturePct: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    qualityFlag: {
      type: String,
      required: true,
      enum: ['GOOD', 'SUSPECT', 'MISSING', 'IMPUTED'],
      default: 'GOOD',
      index: true,
    },
    rawPayload: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Telemetry is immutable observation
    collection: 'telemetry',
  }
);

// High performance compound index for time-series range queries by station
TelemetrySchema.index({ stationCode: 1, observedAt: -1 });

export const Telemetry: Model<ITelemetry> =
  mongoose.models.Telemetry || mongoose.model<ITelemetry>('Telemetry', TelemetrySchema);
