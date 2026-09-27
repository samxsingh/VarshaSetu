import { app } from './app';
import { env } from './config/env';
import { closeDbPool, checkDbHealth } from './db/pool';
import { connectDatabase, closeDatabase, isDatabaseConnected } from './config/database';
import { initSocketServer, closeSocketServer } from './realtime';
import http from 'http';

import { runMongoSeed } from './db/seeds/mongoSeed';

const server = http.createServer(app);

// Initialize real-time Socket.IO server on the authoritative HTTP server
const io = initSocketServer(server);

async function startServer(): Promise<void> {
  try {
    console.log('🌧️  Initializing VarshaSetu Backend Core (MERN Architecture)...');
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`📡 Port: ${env.PORT}`);

    // Connect to MongoDB primary persistence layer
    try {
      await connectDatabase();
      console.log(`🍃 Connected to MongoDB persistence layer (Database: ${env.NODE_ENV !== 'production' ? 'varshasetu' : 'production'})`);

      // Safe, idempotent deterministic seed mechanism for demonstration accounts
      try {
        await runMongoSeed();
      } catch (seedErr: any) {
        console.warn(`⚠️  Demonstration seed verification warning: ${seedErr.message}`);
      }
    } catch (mongoErr: any) {
      console.warn(`⚠️  MongoDB connection deferred or offline (${mongoErr.message}). Gateway will use resilient fallback.`);
    }

    // Check database connectivity
    const dbHealth = await checkDbHealth();
    if (dbHealth.postgres) {
      console.log(`🗄️  Connected to PostgreSQL database: "${dbHealth.databaseName}" (${dbHealth.latencyMs}ms)`);
      console.log(`🗺️  PostGIS spatial status: ${dbHealth.postgis ? 'ENABLED' : 'DISABLED'} (mode: ${dbHealth.postgisMode}, version: ${dbHealth.postgisVersion || 'N/A'})`);
    } else {
      console.warn(`⚠️  PostgreSQL connection failed: ${dbHealth.error}`);
    }

    server.listen(env.PORT, () => {
      console.log(`🚀 VarshaSetu API server listening on http://localhost:${env.PORT}/api/v1`);
      console.log(`⚡ Real-time Socket.IO gateway active on ws://localhost:${env.PORT}`);
      console.log(`🩺 Health check available at: http://localhost:${env.PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error('💥 Fatal error starting VarshaSetu server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
let isShuttingDown = false;

async function handleGracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);

  // Stop accepting new HTTP requests
  server.close(async () => {
    console.log('🛑 HTTP server closed.');

    try {
      // Close Socket.IO connections
      await closeSocketServer();
      console.log('🛑 Socket.IO server closed.');

      // Close MongoDB connection
      await closeDatabase();
      // Drain and close database pool
      await closeDbPool();
      console.log('✅ All connections drained. Exiting cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during shutdown cleanup:', err);
      process.exit(1);
    }
  });

  // Force close if graceful shutdown hangs
  setTimeout(() => {
    console.error('⚠️ Graceful shutdown timeout exceeded (10s). Forcing shutdown.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

startServer();
