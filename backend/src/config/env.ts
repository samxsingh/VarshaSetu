import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env from backend or root directory if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('5001').transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/varshasetu'),
  JWT_SECRET: z.string().min(16).default('varshasetu_development_jwt_secret_key_32chars!'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  
  // Default Demo Location Config
  DEFAULT_DEMO_STATE: z.string().default('Uttar Pradesh'),
  DEFAULT_DEMO_DISTRICT: z.string().default('Lucknow'),
  DEFAULT_DEMO_BLOCK: z.string().default('Bakshi Ka Talab'),
  DEFAULT_DEMO_LATITUDE: z.string().default('26.9749').transform((val) => parseFloat(val)),
  DEFAULT_DEMO_LONGITUDE: z.string().default('80.9276').transform((val) => parseFloat(val)),
  
  RATE_LIMIT_ENABLED: z.string().default('true').transform((val) => val === 'true'),
}).refine((data) => {
  if (data.NODE_ENV === 'production') {
    if (data.JWT_SECRET === 'varshasetu_development_jwt_secret_key_32chars!') {
      return false;
    }
  }
  return true;
}, {
  message: 'In production mode, JWT_SECRET must be explicitly set to a secure key and cannot be the default development secret.',
  path: ['JWT_SECRET'],
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
