import mongoose, { Schema, Document, Model } from 'mongoose';

export type AdvisorySeverity = 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';
export type AdvisoryStatus = 'ACTIVE' | 'DISMISSED' | 'SUPERSEDED' | 'EXPIRED';

export interface ILocalizedContent {
  language: 'EN' | 'HI';
  title: string;
  summary: string;
  riskIndicator: string;
  whatItMeans: string;
  confidenceStatement: string;
  disclosure: string;
  historicalLimitationDisclosure?: string;
  translationMethod: string;
  templateVersion: string;
  terminologyVersion: string;
  localizationFingerprint: string;
}

export interface IAdvisoryReadReceipt {
  userId?: mongoose.Types.ObjectId;
  language: string;
  deviceChannel: string;
  readAt: Date;
}

export interface IAdvisory extends Document {
  advisoryId: string;
  ruleId: string;
  forecastId: string;
  blockId: string;
  cropType: string;
  growthStage: string;
  riskCategory: string;
  severity: AdvisorySeverity;
  actionRecommendation: string;
  scientificRationale: string;
  evidence: Record<string, unknown>;
  safetyGatePassed: boolean;
  status: AdvisoryStatus;
  deduplicationHash: string;
  localizations: ILocalizedContent[];
  readReceipts: IAdvisoryReadReceipt[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const LocalizedContentSchema = new Schema(
  {
    language: { type: String, enum: ['EN', 'HI'], required: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    riskIndicator: { type: String, required: true },
    whatItMeans: { type: String, required: true },
    confidenceStatement: { type: String, required: true },
    disclosure: { type: String, required: true },
    historicalLimitationDisclosure: { type: String, default: '' },
    translationMethod: { type: String, default: 'CONTROLLED_TEMPLATE' },
    templateVersion: { type: String, default: '1.0.0' },
    terminologyVersion: { type: String, default: '1.0.0' },
    localizationFingerprint: { type: String, required: true },
  },
  { _id: false }
);

const AdvisoryReadReceiptSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    language: { type: String, default: 'EN' },
    deviceChannel: { type: String, default: 'WEB_PORTAL' },
    readAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AdvisorySchema = new Schema<IAdvisory>(
  {
    advisoryId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    ruleId: {
      type: String,
      required: true,
      index: true,
    },
    forecastId: {
      type: String,
      required: true,
      index: true,
    },
    blockId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    cropType: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    growthStage: {
      type: String,
      required: true,
      uppercase: true,
    },
    riskCategory: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['INFO', 'WATCH', 'WARNING', 'CRITICAL'],
      default: 'WATCH',
      index: true,
    },
    actionRecommendation: {
      type: String,
      required: true,
    },
    scientificRationale: {
      type: String,
      required: true,
    },
    evidence: {
      type: Schema.Types.Mixed,
      default: {},
    },
    safetyGatePassed: {
      type: Boolean,
      required: true,
      default: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['ACTIVE', 'DISMISSED', 'SUPERSEDED', 'EXPIRED'],
      default: 'ACTIVE',
      index: true,
    },
    deduplicationHash: {
      type: String,
      required: true,
      index: true,
    },
    localizations: {
      type: [LocalizedContentSchema],
      default: [],
    },
    readReceipts: {
      type: [AdvisoryReadReceiptSchema],
      default: [],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'advisories',
  }
);

// Rapid lookups for farmer block + crop advisories
AdvisorySchema.index({ blockId: 1, cropType: 1, status: 1 });

export const Advisory: Model<IAdvisory> =
  mongoose.models.Advisory || mongoose.model<IAdvisory>('Advisory', AdvisorySchema);
