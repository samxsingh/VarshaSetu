import { checkDbHealth, DatabaseHealthStatus } from '../db/pool';
import { env } from '../config/env';

export interface AppHealthStatus {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  database?: DatabaseHealthStatus;
}

export const healthService = {
  getAppHealth(): AppHealthStatus {
    return {
      status: 'ok',
      service: 'varshasetu-backend',
      version: '1.0.0',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  },

  async getDatabaseHealth(): Promise<DatabaseHealthStatus> {
    return checkDbHealth();
  },
};
