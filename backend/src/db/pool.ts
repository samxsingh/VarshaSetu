import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from '../config/env';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('⚠️ Unexpected error on idle PostgreSQL client:', err);
});

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    if (env.NODE_ENV === 'development') {
      const duration = Date.now() - start;
      // Optional debug logging for slow queries
      if (duration > 1000) {
        console.warn(`🐢 Slow Query (${duration}ms): ${text.substring(0, 100)}`);
      }
    }
    return res;
  } catch (error) {
    console.error(`❌ Database Query Error: ${text.substring(0, 150)}`, error);
    throw error;
  }
}

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

export async function closeDbPool(): Promise<void> {
  console.log('🔌 Closing PostgreSQL database connection pool...');
  await pool.end();
  console.log('✅ PostgreSQL connection pool closed.');
}

export interface DatabaseHealthStatus {
  postgres: boolean;
  postgis: boolean;
  postgisVersion?: string;
  postgisMode: 'native' | 'compatibility' | 'unavailable';
  databaseName?: string;
  latencyMs: number;
  error?: string;
}

export async function checkDbHealth(): Promise<DatabaseHealthStatus> {
  const start = Date.now();
  try {
    const pgRes = await pool.query('SELECT current_database() AS db_name, 1 AS health_check');
    const latencyMs = Date.now() - start;
    const dbName = pgRes.rows[0]?.db_name;

    // Check PostGIS
    let postgisAvailable = false;
    let postgisVersion: string | undefined = undefined;
    let postgisMode: 'native' | 'compatibility' | 'unavailable' = 'unavailable';

    try {
      const postgisRes = await pool.query("SELECT PostGIS_Version() AS version");
      postgisAvailable = true;
      postgisVersion = postgisRes.rows[0]?.version;
      postgisMode = postgisVersion?.includes('compatibility') ? 'compatibility' : 'native';
    } catch {
      // Check if fallback spatial functions are installed
      try {
        const fallbackRes = await pool.query(
          "SELECT proname FROM pg_proc WHERE proname = 'postgis_version' LIMIT 1"
        );
        if (fallbackRes.rows.length > 0) {
          postgisAvailable = true;
          postgisMode = 'compatibility';
          postgisVersion = '3.4-compat';
        }
      } catch {
        postgisAvailable = false;
        postgisMode = 'unavailable';
      }
    }

    return {
      postgres: true,
      postgis: postgisAvailable,
      postgisVersion,
      postgisMode,
      databaseName: dbName,
      latencyMs,
    };
  } catch (err: any) {
    return {
      postgres: false,
      postgis: false,
      postgisMode: 'unavailable',
      latencyMs: Date.now() - start,
      error: err.message || 'Unable to connect to PostgreSQL',
    };
  }
}
