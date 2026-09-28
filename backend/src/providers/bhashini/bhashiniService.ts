import { env } from '../../config/env';

export interface BhashiniServiceStatus {
  source: 'BHASHINI';
  status: 'CONFIGURED' | 'NOT_CONFIGURED';
  baseUrl: string;
  hasApiKey: boolean;
  hasInferenceKey: boolean;
  isEnabled: boolean;
  phaseScope: 'PHASE_1_FOUNDATION_PRESERVED';
  note: string;
}

/**
 * Bhashini provider adapter placeholder preserving external configuration.
 * Full voice TTS, dialect translation, and audio pipelines are designated for upcoming integration.
 */
export class BhashiniService {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly inferenceApiKey?: string;
  private readonly isEnabled: boolean;

  constructor() {
    this.baseUrl = env.BHASHINI_API_BASE_URL;
    this.apiKey = env.BHASHINI_API_KEY;
    this.inferenceApiKey = env.BHASHINI_INFERENCE_API_KEY;
    this.isEnabled = env.ENABLE_BHASHINI;
  }

  public getStatus(): BhashiniServiceStatus {
    const hasApiKey = Boolean(this.apiKey && this.apiKey.trim().length > 0);
    const hasInferenceKey = Boolean(this.inferenceApiKey && this.inferenceApiKey.trim().length > 0);
    const isConfigured = hasApiKey || hasInferenceKey;

    return {
      source: 'BHASHINI',
      status: isConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED',
      baseUrl: this.baseUrl,
      hasApiKey,
      hasInferenceKey,
      isEnabled: this.isEnabled,
      phaseScope: 'PHASE_1_FOUNDATION_PRESERVED',
      note: 'Configuration preserved. Voice alerts and dialect translation pipeline will be integrated in designated voice phase.',
    };
  }
}

export const bhashiniService = new BhashiniService();
