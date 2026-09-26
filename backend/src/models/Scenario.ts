import mongoose, { Schema, Document, Model } from 'mongoose';

export type ScenarioType = 'SOWING_DELAY' | 'IRRIGATION_DEFICIT' | 'MONSOON_BREAK' | 'TEMPERATURE_EXTREME';

export interface IScenarioDelta {
  metric: string;
  baselineValue: number;
  scenarioValue: number;
  deltaPct: number;
  riskShift: string;
}

export interface IScenarioSensitivity {
  parameterName: string;
  parameterRange: Record<string, unknown>;
  curvePoints: Array<Record<string, unknown>>;
  envelope?: Record<string, unknown>;
}

export interface IScenario extends Document {
  scenarioId: string;
  userId?: mongoose.Types.ObjectId;
  blockId: string;
  cropType: string;
  growthStage: string;
  baselineForecastId: string;
  scenarioType: ScenarioType;
  classification: string;
  scenarioParameters: Record<string, unknown>;
  scenarioResults: Record<string, unknown>;
  deltas: IScenarioDelta[];
  envelope?: Record<string, unknown>;
  sensitivities: IScenarioSensitivity[];
  explanation: Record<string, unknown>;
  provenance: Record<string, unknown>;
  scientificDisclaimer: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ScenarioDeltaSchema = new Schema(
  {
    metric: { type: String, required: true },
    baselineValue: { type: Number, required: true },
    scenarioValue: { type: Number, required: true },
    deltaPct: { type: Number, required: true },
    riskShift: { type: String, required: true },
  },
  { _id: false }
);

const ScenarioSensitivitySchema = new Schema(
  {
    parameterName: { type: String, required: true },
    parameterRange: { type: Schema.Types.Mixed, required: true },
    curvePoints: { type: [Schema.Types.Mixed], default: [] },
    envelope: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const ScenarioSchema = new Schema<IScenario>(
  {
    scenarioId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
    baselineForecastId: {
      type: String,
      required: true,
    },
    scenarioType: {
      type: String,
      required: true,
      enum: ['SOWING_DELAY', 'IRRIGATION_DEFICIT', 'MONSOON_BREAK', 'TEMPERATURE_EXTREME'],
      default: 'SOWING_DELAY',
      index: true,
    },
    classification: {
      type: String,
      required: true,
      default: 'SCENARIO_INDICATOR_ONLY',
    },
    scenarioParameters: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    scenarioResults: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    deltas: {
      type: [ScenarioDeltaSchema],
      default: [],
    },
    envelope: {
      type: Schema.Types.Mixed,
      default: null,
    },
    sensitivities: {
      type: [ScenarioSensitivitySchema],
      default: [],
    },
    explanation: {
      type: Schema.Types.Mixed,
      default: {},
    },
    provenance: {
      type: Schema.Types.Mixed,
      default: {},
    },
    scientificDisclaimer: {
      type: String,
      default:
        'This scenario evaluates meteorological and agro-meteorological sensitivity indicators only. It does NOT predict crop yields, biomass production, revenue, or guaranteed agronomic outcomes.',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'scenarios',
  }
);

ScenarioSchema.index({ blockId: 1, cropType: 1, createdAt: -1 });

export const Scenario: Model<IScenario> =
  mongoose.models.Scenario || mongoose.model<IScenario>('Scenario', ScenarioSchema);
