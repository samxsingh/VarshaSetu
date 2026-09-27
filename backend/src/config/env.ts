import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env from backend or root directory if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
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
  
  // Default Demo Location Config
  DEFAULT_DEMO_STATE: z.string().default('Uttar Pradesh'),
  DEFAULT_DEMO_DISTRICT: z.string().default('Lucknow'),
  DEFAULT_DEMO_BLOCK: z.string().default('Bakshi Ka Talab'),
  DEFAULT_DEMO_LATITUDE: z.string().default('26.9749').transform((val) => parseFloat(val)),
  DEFAULT_DEMO_LONGITUDE: z.string().default('80.9276').transform((val) => parseFloat(val)),

  // Safe Feature Flags (All default to false; offline/safe fallback preserved)
  ENABLE_BHASHINI: z.string().default('false').transform((val) => val === 'true'),
  ENABLE_EXTERNAL_VOICE: z.string().default('false').transform((val) => val === 'true'),
  ENABLE_SMS: z.string().default('false').transform((val) => val === 'true'),
  ENABLE_WHATSAPP: z.string().default('false').transform((val) => val === 'true'),
  ENABLE_EMAIL: z.string().default('false').transform((val) => val === 'true'),
  ENABLE_EXTERNAL_LLM: z.string().default('false').transform((val) => val === 'true'),

  // Government / Indian Language Services (Bhashini) - Optional
  BHASHINI_API_BASE_URL: z.string().optional(),
  BHASHINI_API_KEY: z.string().optional(),
  BHASHINI_USER_ID: z.string().optional(),
  BHASHINI_PIPELINE_ID: z.string().optional(),

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
