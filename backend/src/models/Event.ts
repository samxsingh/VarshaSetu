import mongoose, { Schema, Document, Model } from 'mongoose';

export type EventSeverity = 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';
export type EventState =
  | 'DETECTED'
  | 'ACKNOWLEDGED'
  | 'UPDATED'
  | 'RESOLVED'
  | 'EXPIRED'
  | 'SUPPRESSED';

export interface IEventStateTransition {
  transitionId: string;
  previousState: EventState;
  newState: EventState;
  actor: string;
  reason: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface IEvent extends Document {
  eventId: string;
  eventType: string;
  forecastId: string;
  blockId: string;
  detectedAt: Date;
  validFrom: Date;
  validUntil: Date;
  probability: number;
  threshold: number;
  unit: string;
  severity: EventSeverity;
  confidenceStatus: string;
  operationalStatus: string;
  dataFreshness: string;
  validationStatus: string;
  explanationReference?: string;
  state: EventState;
  description: string;
  deduplicationHash: string;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  transitions: IEventStateTransition[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const EventStateTransitionSchema = new Schema(
  {
    transitionId: { type: String, required: true },
    previousState: { type: String, required: true },
    newState: { type: String, required: true },
    actor: { type: String, required: true, default: 'SYSTEM' },
    reason: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const EventSchema = new Schema<IEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    eventType: {
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
    detectedAt: {
      type: Date,
      required: true,
      default: Date.now,
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
    threshold: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      default: 'mm',
    },
    severity: {
      type: String,
      required: true,
      enum: ['INFO', 'WATCH', 'WARNING', 'CRITICAL'],
      default: 'WATCH',
      index: true,
    },
    confidenceStatus: {
      type: String,
      required: true,
      default: 'MODERATE_CONFIDENCE',
    },
    operationalStatus: {
      type: String,
      required: true,
      default: 'DIAGNOSTIC_ONLY',
    },
    dataFreshness: {
      type: String,
      required: true,
      default: 'HISTORICAL_ONLY',
    },
    validationStatus: {
      type: String,
      required: true,
      default: 'INSUFFICIENT_DATA',
    },
    explanationReference: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      required: true,
      enum: ['DETECTED', 'ACKNOWLEDGED', 'UPDATED', 'RESOLVED', 'EXPIRED', 'SUPPRESSED'],
      default: 'DETECTED',
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    deduplicationHash: {
      type: String,
      required: true,
      index: true,
    },
    acknowledgedBy: {
      type: String,
      default: null,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: String,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    transitions: {
      type: [EventStateTransitionSchema],
      default: [],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'events',
  }
);

// High-speed compound queries for active block alerts
EventSchema.index({ blockId: 1, state: 1, validFrom: -1 });

export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
