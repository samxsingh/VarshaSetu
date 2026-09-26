import mongoose from 'mongoose';
import { env } from './env';

interface DatabaseConnectionOptions {
  uri?: string;
  dbName?: string;
}

let isConnecting = false;

/**
 * Connect to MongoDB with Mongoose using resilient configuration.
 */
export async function connectDatabase(options: DatabaseConnectionOptions = {}): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    // Already connected
    return mongoose;
  }

  if (isConnecting) {
    // Wait for in-progress connection
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve(mongoose));
      mongoose.connection.once('error', (err) => reject(err));
    });
  }

  const uri = options.uri || env.MONGODB_URI || 'mongodb://127.0.0.1:27017/varshasetu';
  const dbName = options.dbName || process.env.MONGODB_DB_NAME || 'varshasetu';

  try {
    isConnecting = true;
    console.info(`[MongoDB] Connecting to database: ${dbName} at ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);

    mongoose.set('strictQuery', true);

    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: env.NODE_ENV !== 'production', // Build indexes automatically in non-production
    });

    isConnecting = false;
    console.info(`[MongoDB] Connected successfully to database: ${mongoose.connection.name}`);

    // Set up connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error event:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Connection disconnected');
    });

    return mongoose;
  } catch (err: any) {
    isConnecting = false;
    console.error(`[MongoDB] Connection failed: ${err.message}`);
    throw err;
  }
}

/**
 * Gracefully close database connection.
 */
export async function closeDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.info('[MongoDB] Connection closed successfully');
  }
}

/**
 * Check MongoDB connection status.
 */
export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// Graceful process exit handlers
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});
