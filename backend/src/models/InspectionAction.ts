import mongoose, { Schema, Document, Model } from 'mongoose';

export type InspectionActionType =
  | 'DATA_QUALITY_CHECK'
  | 'STATION_INSPECTION'
  | 'FORECAST_REVIEW'
  | 'ADVISORY_REVIEW'
  | 'MODEL_EVIDENCE_REVIEW'
  | 'FIELD_OBSERVATION';

export type InspectionActionStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type InspectionActionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IInspectionAuditEntry {
  from: string;
  to: string;
  actorId: string;
  actorRole: string;
  timestamp: Date;
  reason: string;
}

export interface IInspectionAction extends Document {
  actionId: string;
  signalId: string;
  blockId: string;
  actionType: InspectionActionType;
  title: string;
  description: string;
  status: InspectionActionStatus;
  priority: InspectionActionPriority;
  createdBy: string;
  assignedTo: string | null;
  createdAt: Date;
  assignedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  completionNotes: string | null;
  cancellationReason: string | null;
  sourceSignal: Record<string, unknown>;
  auditTrail: IInspectionAuditEntry[];
  updatedAt: Date;
}

const InspectionAuditEntrySchema = new Schema<IInspectionAuditEntry>(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    actorId: { type: String, required: true },
    actorRole: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    reason: { type: String, required: true },
  },
  { _id: false }
);

const InspectionActionSchema = new Schema<IInspectionAction>(
  {
    actionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    signalId: {
      type: String,
      required: true,
      index: true,
    },
    blockId: {
      type: String,
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      required: true,
      enum: [
        'DATA_QUALITY_CHECK',
        'STATION_INSPECTION',
        'FORECAST_REVIEW',
        'ADVISORY_REVIEW',
        'MODEL_EVIDENCE_REVIEW',
        'FIELD_OBSERVATION',
      ],
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'OPEN',
      index: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    createdBy: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: String,
      default: null,
      index: true,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    completionNotes: {
      type: String,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    sourceSignal: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    auditTrail: {
      type: [InspectionAuditEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'inspection_actions',
  }
);

// High-speed compound queries for workflow monitoring
InspectionActionSchema.index({ blockId: 1, status: 1, createdAt: -1 });
InspectionActionSchema.index({ assignedTo: 1, status: 1 });
InspectionActionSchema.index({ actionType: 1, createdAt: -1 });

export const InspectionAction: Model<IInspectionAction> =
  mongoose.models.InspectionAction ||
  mongoose.model<IInspectionAction>('InspectionAction', InspectionActionSchema);
