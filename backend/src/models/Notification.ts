import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'VOICE';
export type NotificationDeliveryStatus = 'SIMULATED' | 'DELIVERED' | 'NOT_CONFIGURED' | 'FAILED' | 'SUPPRESSED';

export interface INotificationDelivery {
  deliveryId: string;
  messageId: string;
  eventId?: string;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  title: string;
  body: string;
  dispatchedAt: Date;
  details?: Record<string, unknown>;
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  role: string;
  preferredLanguage: string;
  eventTypes: string[];
  minimumSeverity: 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';
  enabled: boolean;
  channels: NotificationChannel[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
  deliveries: INotificationDelivery[];
  createdAt: Date;
  updatedAt: Date;
}

const NotificationDeliverySchema = new Schema(
  {
    deliveryId: { type: String, required: true },
    messageId: { type: String, required: true },
    eventId: { type: String, default: null },
    channel: {
      type: String,
      enum: ['IN_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'VOICE'],
      required: true,
    },
    status: {
      type: String,
      enum: ['SIMULATED', 'DELIVERED', 'NOT_CONFIGURED', 'FAILED', 'SUPPRESSED'],
      default: 'SIMULATED',
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    dispatchedAt: { type: Date, default: Date.now },
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
    },
    preferredLanguage: {
      type: String,
      default: 'en',
    },
    eventTypes: {
      type: [String],
      default: [
        'HEAVY_RAIN_RISK',
        'DRY_SPELL_RISK',
        'MONSOON_ONSET_RISK',
        'FALSE_ONSET_RISK',
        'RAINFALL_ANOMALY',
      ],
    },
    minimumSeverity: {
      type: String,
      enum: ['INFO', 'WATCH', 'WARNING', 'CRITICAL'],
      default: 'WATCH',
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    channels: {
      type: [String],
      default: ['IN_APP'],
    },
    quietHoursStart: {
      type: String,
      default: null,
    },
    quietHoursEnd: {
      type: String,
      default: null,
    },
    deliveries: {
      type: [NotificationDeliverySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
