import mongoose, { Schema, Document, Model } from 'mongoose';

export type CropSeason = 'KHARIF' | 'RABI' | 'ZAID';

export interface IPhenologicalStage {
  stageId: string;
  stageName: string;
  hindiStageName: string;
  durationDays: number;
  waterRequirementMm: number;
  sensitivityToWaterlogging: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sensitivityToDrought: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ICrop extends Document {
  cropId: string;
  name: string;
  hindiName: string;
  season: CropSeason;
  stages: IPhenologicalStage[];
  soilSuitability: string[];
  rules: string[]; // Associated rule IDs
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PhenologicalStageSchema = new Schema(
  {
    stageId: { type: String, required: true },
    stageName: { type: String, required: true },
    hindiStageName: { type: String, required: true },
    durationDays: { type: Number, required: true, min: 1 },
    waterRequirementMm: { type: Number, required: true, min: 0 },
    sensitivityToWaterlogging: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    sensitivityToDrought: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
  },
  { _id: false }
);

const CropSchema = new Schema<ICrop>(
  {
    cropId: {
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
    hindiName: {
      type: String,
      required: true,
      trim: true,
    },
    season: {
      type: String,
      required: true,
      enum: ['KHARIF', 'RABI', 'ZAID'],
      index: true,
    },
    stages: {
      type: [PhenologicalStageSchema],
      default: [],
    },
    soilSuitability: {
      type: [String],
      default: ['ALLUVIAL', 'CLAY_LOAM'],
    },
    rules: {
      type: [String],
      default: [],
    },
    isActive: {
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
    collection: 'crops',
  }
);

export const Crop: Model<ICrop> =
  mongoose.models.Crop || mongoose.model<ICrop>('Crop', CropSchema);
