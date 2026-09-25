import { app } from './app';
import { env } from './config/env';
import { closeDbPool, checkDbHealth } from './db/pool';
import http from 'http';

const server = http.createServer(app);

async function startServer(): Promise<void> {
  try {
    console.log('🌧️  Initializing VarshaSetu Backend Core...');
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`📡 Port: ${env.PORT}`);

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
