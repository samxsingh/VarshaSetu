import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env from backend or root directory if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const envSchema = z.object({
  // Core Server & Database
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('5001').transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/varshasetu'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/varshasetu'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  ML_SERVICE_URL: z.string().default('http://localhost:8000'),
  
  // Authentication & Secrets
  JWT_SECRET: z.string().min(16).default('varshasetu_development_jwt_secret_key_32chars!'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(16).default('varshasetu_development_refresh_secret_key_32chars!'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  ENABLE_DEMO_ACCOUNTS: z.string().default('true').transform((val) => val === 'true'),

  // Networking & Security
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RATE_LIMIT_ENABLED: z.string().default('true').transform((val) => val === 'true'),
  
  // Default Demo Location Config (Lucknow Centroid UP_LKO_BKT)
  DEFAULT_DEMO_STATE: z.string().default('Uttar Pradesh'),
  DEFAULT_DEMO_DISTRICT: z.string().default('Lucknow'),
  DEFAULT_DEMO_BLOCK: z.string().default('Bakshi Ka Talab'),
  DEFAULT_DEMO_LATITUDE: z.string().default('26.9749').transform((val) => parseFloat(val)),
  DEFAULT_DEMO_LONGITUDE: z.string().default('80.9276').transform((val) => parseFloat(val)),

  // ============================================================================
  // EXTERNAL DATA PROVIDERS FOUNDATION
  // ============================================================================

  // Provider A: ECMWF (Numerical Weather Prediction / Atmospheric Forecasts)
  ECMWF_API_KEY: z.string().optional(),
  ECMWF_API_BASE_URL: z.string().default('https://api.ecmwf.int/v1'),

  // Provider B: BHASHINI (National Language Translation & Speech Infrastructure)
  BHASHINI_API_KEY: z.string().optional(), // Udyat User / Auth Key
  BHASHINI_INFERENCE_API_KEY: z.string().optional(), // ULCA / Dhruva Inference API Key
  BHASHINI_API_BASE_URL: z.string().default('https://dhruva-api.bhashini.gov.in/services/inference/v4'),
  BHASHINI_USER_ID: z.string().optional(),
  BHASHINI_PIPELINE_ID: z.string().optional(),

  // Provider C: IMD (India Meteorological Department Observations, Warnings, & Nowcasts)
  IMD_API_BASE_URL: z.string().default('https://api.imd.gov.in/api/v1'),
  IMD_API_KEY: z.string().optional(),
  IMD_ENABLED: z.string().default('true').transform((val) => val === 'true'),
  IMD_CURRENT_WEATHER_ENDPOINT: z.string().default('/current_wx'),
  IMD_DISTRICT_RAINFALL_ENDPOINT: z.string().default('/districtrainfall'),
  IMD_DISTRICT_WARNING_ENDPOINT: z.string().default('/districtwarning'),
  IMD_DISTRICT_NOWCAST_ENDPOINT: z.string().default('/districtnowcast'),
  IMD_DEFAULT_STATION_ID: z.string().default('42182'),
  IMD_DEFAULT_DISTRICT_ID: z.string().default('164'),

  // IMD Reference / Visualization URLs (Explicitly marked as Reference / Provenance, NOT data ingestion endpoints)
  IMD_RAINFALL_VISUALIZATION_URL: z.string().default('https://mausam.imd.gov.in/responsive/rainfallinformation.php'),
  IMD_WARNING_VISUALIZATION_URL: z.string().default('https://mausam.imd.gov.in/responsive/districtWiseWarningGIS.php'),
  IMD_NOWCAST_VISUALIZATION_URL: z.string().default('https://mausam.imd.gov.in/responsive/districtWiseNowcastGIS.php'),

  // Open-Meteo Ingestion Service
  OPEN_METEO_BASE_URL: z.string().default('https://api.open-meteo.com/v1'),
  OPEN_METEO_ENABLED: z.string().default('true').transform((val) => val === 'true'),

  // NASA POWER Agroclimatology Service
  NASA_POWER_BASE_URL: z.string().default('https://power.larc.nasa.gov/api'),
  NASA_POWER_ENABLED: z.string().default('true').transform((val) => val === 'true'),

  // Ingestion Scheduling & Caching
  DATA_REFRESH_INTERVAL_MINUTES: z.string().default('15').transform((val) => parseInt(val, 10)),
  WEATHER_CACHE_TTL_MINUTES: z.string().default('30').transform((val) => parseInt(val, 10)),
  LIVE_DATA_ENABLED: z.string().default('true').transform((val) => val === 'true'),

  // Operational Simulation / Mock Provider Toggle
  SIMULATION_MODE: z.string().default('false').transform((val) => val === 'true'),
  USE_MOCK_PROVIDERS: z.string().optional().transform((val) => val === 'true'),

  // Safe Feature Flags (All default to false; offline/safe fallback preserved)
  ENABLE_BHASHINI: z.string().default('false').transform((val) => val === 'true'),
  ENABLE_EXTERNAL_VOICE: z.string().default('false').transform((val) => val === 'true'),
  ENABLE_SMS: z.string().default('false').transform((val) => val === 'true'),
  ENABLE_WHATSAPP: z.string().default('false').transform((val) => val === 'true'),
  ENABLE_EMAIL: z.string().default('false').transform((val) => val === 'true'),
  ENABLE_EXTERNAL_LLM: z.string().default('false').transform((val) => val === 'true'),

  // Voice / TTS Fallback - Optional
  GOOGLE_CLOUD_PROJECT_ID: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  AZURE_SPEECH_KEY: z.string().optional(),
  AZURE_SPEECH_REGION: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),

  // Notification Delivery (SMS / WhatsApp) - Optional
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  TWILIO_WHATSAPP_FROM: z.string().optional(),
  META_WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  META_WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  META_WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),
  META_WHATSAPP_API_VERSION: z.string().optional(),

  // Email Delivery - Optional
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587').transform((val) => parseInt(val, 10)),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),

  // Maps / Geospatial - Optional
  MAPBOX_ACCESS_TOKEN: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  NOMINATIM_BASE_URL: z.string().default('https://nominatim.openstreetmap.org'),

  // AI / LLM Configuration Placeholders - Optional
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // Identity / OAuth - Optional
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Observability - Optional
  SENTRY_DSN: z.string().optional(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
  OTEL_SERVICE_NAME: z.string().default('varshasetu-backend'),
}).refine((data) => {
  if (data.NODE_ENV === 'production') {
    const weakSecrets = ['secret', '123456', 'password', 'varshasetu_development_jwt_secret_key_32chars!'];
    if (weakSecrets.includes(data.JWT_SECRET) || data.JWT_SECRET.length < 32) {
      return false;
    }
  }
  return true;
}, {
  message: 'In production mode, JWT_SECRET must be explicitly set to a secure key with >= 32 characters and cannot be a default/weak key.',
  path: ['JWT_SECRET'],
}).refine((data) => {
  if (data.NODE_ENV === 'production') {
    const weakSecrets = ['secret', '123456', 'password', 'varshasetu_development_refresh_secret_key_32chars!'];
    if (weakSecrets.includes(data.JWT_REFRESH_SECRET) || data.JWT_REFRESH_SECRET.length < 32 || data.JWT_REFRESH_SECRET === data.JWT_SECRET) {
      return false;
    }
  }
  return true;
}, {
  message: 'In production mode, JWT_REFRESH_SECRET must be explicitly set to a unique secure key with >= 32 characters and must not equal JWT_SECRET.',
  path: ['JWT_REFRESH_SECRET'],
});

export type EnvConfig = z.infer<typeof envSchema>;

let parsedEnv: EnvConfig;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid Backend Environment Configuration:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  } else {
    console.error('❌ Environment configuration error:', error);
  }
  process.exit(1);
}

export const env = parsedEnv;

// ============================================================================
// PROVIDER CONFIGURATION STATUS & CONVENIENCE HELPERS
// ============================================================================

export type ProviderStatus = 'CONFIGURED' | 'NOT_CONFIGURED';

export interface SystemProviderConfigStatus {
  ecmwf: {
    status: ProviderStatus;
    baseUrl: string;
    hasKey: boolean;
  };
  bhashini: {
    status: ProviderStatus;
    baseUrl: string;
    hasApiKey: boolean;
    hasInferenceKey: boolean;
  };
  imd: {
    status: ProviderStatus;
    baseUrl: string;
    hasKey: boolean;
    isEnabled: boolean;
    endpoints: {
      currentWeather: string;
      districtRainfall: string;
      districtWarning: string;
      districtNowcast: string;
    };
    referenceVisualizations: {
      rainfallInformation: string;
      districtWarningGis: string;
      districtNowcastGis: string;
    };
    defaults: {
      stationId: string;
      districtId: string;
    };
  };
  openMeteo: {
    status: ProviderStatus;
    baseUrl: string;
    isEnabled: boolean;
  };
  nasaPower: {
    status: ProviderStatus;
    baseUrl: string;
    isEnabled: boolean;
    hasKey: boolean;
    isKeyless: boolean;
    serviceRole: string;
    latencyNote: string;
  };
  simulationMode: boolean;
  useMockProviders: boolean;
}

/**
 * Returns the operational configuration status for each external provider
 * WITHOUT exposing any sensitive API keys or credentials.
 */
export function getProviderConfigStatus(config: EnvConfig = env): SystemProviderConfigStatus {
  const hasEcmwfKey = Boolean(config.ECMWF_API_KEY && config.ECMWF_API_KEY.trim().length > 0);
  const hasBhashiniApiKey = Boolean(config.BHASHINI_API_KEY && config.BHASHINI_API_KEY.trim().length > 0);
  const hasBhashiniInferenceKey = Boolean(config.BHASHINI_INFERENCE_API_KEY && config.BHASHINI_INFERENCE_API_KEY.trim().length > 0);
  const hasImdKey = Boolean(config.IMD_API_KEY && config.IMD_API_KEY.trim().length > 0);

  return {
    ecmwf: {
      status: hasEcmwfKey ? 'CONFIGURED' : 'NOT_CONFIGURED',
      baseUrl: config.ECMWF_API_BASE_URL,
      hasKey: hasEcmwfKey,
    },
    bhashini: {
      status: hasBhashiniApiKey || hasBhashiniInferenceKey ? 'CONFIGURED' : 'NOT_CONFIGURED',
      baseUrl: config.BHASHINI_API_BASE_URL,
      hasApiKey: hasBhashiniApiKey,
      hasInferenceKey: hasBhashiniInferenceKey,
    },
    imd: {
      status: config.IMD_ENABLED ? 'CONFIGURED' : 'NOT_CONFIGURED',
      baseUrl: config.IMD_API_BASE_URL,
      hasKey: hasImdKey,
      isEnabled: config.IMD_ENABLED,
      endpoints: {
        currentWeather: config.IMD_CURRENT_WEATHER_ENDPOINT,
        districtRainfall: config.IMD_DISTRICT_RAINFALL_ENDPOINT,
        districtWarning: config.IMD_DISTRICT_WARNING_ENDPOINT,
        districtNowcast: config.IMD_DISTRICT_NOWCAST_ENDPOINT,
      },
      referenceVisualizations: {
        rainfallInformation: config.IMD_RAINFALL_VISUALIZATION_URL,
        districtWarningGis: config.IMD_WARNING_VISUALIZATION_URL,
        districtNowcastGis: config.IMD_NOWCAST_VISUALIZATION_URL,
      },
      defaults: {
        stationId: config.IMD_DEFAULT_STATION_ID,
        districtId: config.IMD_DEFAULT_DISTRICT_ID,
      },
    },
    openMeteo: {
      status: config.OPEN_METEO_ENABLED ? 'CONFIGURED' : 'NOT_CONFIGURED',
      baseUrl: config.OPEN_METEO_BASE_URL,
      isEnabled: config.OPEN_METEO_ENABLED,
    },
    nasaPower: {
      status: config.NASA_POWER_ENABLED && Boolean(config.NASA_POWER_BASE_URL) ? 'CONFIGURED' : 'NOT_CONFIGURED',
      baseUrl: config.NASA_POWER_BASE_URL,
      isEnabled: config.NASA_POWER_ENABLED,
      hasKey: false,
      isKeyless: true,
      serviceRole: 'HISTORICAL_REANALYSIS_AND_AGROCLIMATOLOGY',
      latencyNote: 'Near-real-time products have ~2-4 days operational latency; not a live stream.',
    },
    simulationMode: Boolean(config.SIMULATION_MODE),
    useMockProviders: Boolean(config.USE_MOCK_PROVIDERS),
  };
}

// IMD Endpoint Identifier
export type ImdEndpointKey =
  | 'current_weather'
  | 'district_rainfall'
  | 'district_warning'
  | 'district_nowcast';

/**
 * Constructs a fully qualified IMD API URL for a designated endpoint and query parameters.
 * Handles trailing/leading slashes and URL query encoding without hardcoding parameters into base URLs.
 */
export function buildImdUrl(
  endpointKeyOrPath: ImdEndpointKey | string,
  params?: Record<string, string | number | boolean | null | undefined>,
  customBaseUrl?: string
): string {
  const baseUrl = (customBaseUrl || env.IMD_API_BASE_URL).replace(/\/+$/, '');

  let path: string;
  switch (endpointKeyOrPath) {
    case 'current_weather':
      path = env.IMD_CURRENT_WEATHER_ENDPOINT;
      break;
    case 'district_rainfall':
      path = env.IMD_DISTRICT_RAINFALL_ENDPOINT;
      break;
    case 'district_warning':
      path = env.IMD_DISTRICT_WARNING_ENDPOINT;
      break;
    case 'district_nowcast':
      path = env.IMD_DISTRICT_NOWCAST_ENDPOINT;
      break;
    default:
      path = endpointKeyOrPath;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = new URL(`${baseUrl}${normalizedPath}`);

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        fullUrl.searchParams.append(key, String(val));
      }
    });
  }

  return fullUrl.toString();
}

/**
 * IMD Official GIS & Web Visualizations.
 * NOTE: These are strictly reference/provenance URLs for visual inspection, browser links,
 * and scientific attribution. They are NOT machine-readable JSON ingestion endpoints.
 */
export const IMD_REFERENCE_VISUALIZATIONS = {
  RAINFALL_INFORMATION: env.IMD_RAINFALL_VISUALIZATION_URL,
  DISTRICT_WARNING_GIS: env.IMD_WARNING_VISUALIZATION_URL,
  DISTRICT_NOWCAST_GIS: env.IMD_NOWCAST_VISUALIZATION_URL,
} as const;
