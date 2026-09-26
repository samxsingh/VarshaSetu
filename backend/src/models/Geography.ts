import mongoose, { Schema, Document, Model } from 'mongoose';

export type AdministrativeLevel = 'STATE' | 'DISTRICT' | 'BLOCK' | 'PANCHAYAT' | 'VILLAGE';

export interface IGeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IGeoJSONMultiPolygon {
  type: 'MultiPolygon';
  coordinates: number[][][][];
}

export interface IGeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface IGeography extends Document {
  code: string;
  name: string;
  level: AdministrativeLevel;
  parentId?: mongoose.Types.ObjectId;
  center: IGeoJSONPoint;
  boundary?: IGeoJSONMultiPolygon | IGeoJSONPolygon;
  areaSqKm?: number;
  source: string;
  sourceVersion?: string;
  isDemo: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const GeoJSONPointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [lon, lat]
      required: true,
      validate: {
        validator: (v: number[]) => v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90,
        message: 'Coordinates must be [longitude, latitude] within valid geographic bounds',
      },
    },
  },
  { _id: false }
);

const GeoJSONGeometrySchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon'],
      required: true,
    },
    coordinates: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const GeographySchema = new Schema<IGeography>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      enum: ['STATE', 'DISTRICT', 'BLOCK', 'PANCHAYAT', 'VILLAGE'],
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Geography',
      default: null,
      index: true,
    },
    center: {
      type: GeoJSONPointSchema,
      required: true,
    },
    boundary: {
      type: GeoJSONGeometrySchema,
      required: false,
    },
    areaSqKm: {
      type: Number,
      min: 0,
      default: null,
    },
    source: {
      type: String,
      required: true,
      default: 'IMD_SURVEY_OF_INDIA',
    },
    sourceVersion: {
      type: String,
      default: '2024.1',
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
    collection: 'geography',
  }
);

// 2dsphere spatial indexes
GeographySchema.index({ boundary: '2dsphere' });
GeographySchema.index({ center: '2dsphere' });
GeographySchema.index({ level: 1, parentId: 1 });

export const Geography: Model<IGeography> =
  mongoose.models.Geography || mongoose.model<IGeography>('Geography', GeographySchema);
