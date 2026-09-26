import mongoose, { Schema, Document, Model } from 'mongoose';
import { IGeoJSONPoint } from './Geography';

export type StationProvider = 'IMD_AWS' | 'UP_AGRICULTURE' | 'STATE_DISASTER' | 'RESEARCH_MESONET';
export type StationStatus = 'ACTIVE' | 'OFFLINE' | 'DEGRADED' | 'MAINTENANCE';

export interface ISensorConfig {
  variable: string; // e.g. RAINFALL, TEMPERATURE, RELATIVE_HUMIDITY
  unit: string;
  manufacturer?: string;
  lastCalibratedAt?: Date;
  isHealthy: boolean;
}

export interface IStation extends Document {
  stationCode: string;
  name: string;
  provider: StationProvider;
  location: IGeoJSONPoint;
  elevationMeters?: number;
  blockId?: mongoose.Types.ObjectId;
  status: StationStatus;
  sensors: ISensorConfig[];
  lastPingAt?: Date;
  isDemo: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const SensorConfigSchema = new Schema(
  {
    variable: { type: String, required: true },
    unit: { type: String, required: true },
    manufacturer: { type: String, default: null },
    lastCalibratedAt: { type: Date, default: null },
    isHealthy: { type: Boolean, default: true },
  },
  { _id: false }
);

const StationSchema = new Schema<IStation>(
  {
    stationCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ['IMD_AWS', 'UP_AGRICULTURE', 'STATE_DISASTER', 'RESEARCH_MESONET'],
      default: 'IMD_AWS',
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: (v: number[]) => v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90,
          message: 'Station location must be valid [longitude, latitude]',
        },
      },
    },
    elevationMeters: {
      type: Number,
      default: null,
    },
    blockId: {
      type: Schema.Types.ObjectId,
      ref: 'Geography',
      default: null,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['ACTIVE', 'OFFLINE', 'DEGRADED', 'MAINTENANCE'],
      default: 'ACTIVE',
      index: true,
    },
    sensors: {
      type: [SensorConfigSchema],
      default: [],
    },
    lastPingAt: {
      type: Date,
      default: null,
    },
    isDemo: {
      type: Boolean,
      default: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'stations',
  }
);

StationSchema.index({ location: '2dsphere' });

export const Station: Model<IStation> =
  mongoose.models.Station || mongoose.model<IStation>('Station', StationSchema);
