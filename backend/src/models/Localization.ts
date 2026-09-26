import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILocalization extends Document {
  key: string;
  category: 'AGRONOMY' | 'METEOROLOGY' | 'UI' | 'DISCLOSURE';
  en: string;
  hi: string;
  scientificDefinition?: string;
  farmerExplanation?: string;
  templateVersion: string;
  terminologyVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const LocalizationSchema = new Schema<ILocalization>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['AGRONOMY', 'METEOROLOGY', 'UI', 'DISCLOSURE'],
      index: true,
    },
    en: {
      type: String,
      required: true,
    },
    hi: {
      type: String,
      required: true,
    },
    scientificDefinition: {
      type: String,
      default: null,
    },
    farmerExplanation: {
      type: String,
      default: null,
    },
    templateVersion: {
      type: String,
      default: '1.0.0',
    },
    terminologyVersion: {
      type: String,
      default: '1.0.0',
    },
  },
  {
    timestamps: true,
    collection: 'localizations',
  }
);

export const Localization: Model<ILocalization> =
  mongoose.models.Localization || mongoose.model<ILocalization>('Localization', LocalizationSchema);
