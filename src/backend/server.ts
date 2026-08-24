import express from 'express';
import { createApp, registerErrorHandlers } from './app';
import { connectDatabase } from './config/database';
import { ENV } from './config/env';
import { logger } from './config/logger';

async function startBackendServer() {
  try {
    // 1. Initialize data layer
    await connectDatabase();

    // 2. Build modular Express application
    const app = createApp();

    // 3. Register root landing page for direct backend API inspection
    app.get('/', (req, res) => {
      res.json({
        service: 'RIDEMATE Production Backend API',
        version: '1.0.0',
        status: 'online',
        endpoints: {
          health: '/api/health',
          auth: '/api/v1/auth',
          cars: '/api/v1/cars',
          bookings: '/api/v1/bookings',
          operations: '/api/v1/operations',
          stats: '/api/v1/stats',
          ai: '/api/v1/ai',
        },
        documentation: '/docs',
        timestamp: new Date().toISOString(),
      });
    });

    // 4. Register error and 404 interceptors
    registerErrorHandlers(app);

    // 5. Start listening on dedicated backend port (default 5000)
    const PORT = Number(process.env.BACKEND_PORT) || Number(process.env.PORT) || 5000;
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`=======================================================`, 'Backend');
      logger.info(`  RIDEMATE STANDALONE BACKEND API SERVER RUNNING`, 'Backend');
      logger.info(`  URL: http://localhost:${PORT}`, 'Backend');
      logger.info(`  Health: http://localhost:${PORT}/api/health`, 'Backend');
      logger.info(`  API v1: http://localhost:${PORT}/api/v1`, 'Backend');
      logger.info(`=======================================================`, 'Backend');
    });

    const shutdown = () => {
      logger.info('Shutting down backend server...', 'Backend');
      server.close(() => {
        logger.info('Backend server closed.', 'Backend');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error('Failed to start backend server', 'Backend', err);
    process.exit(1);
  }
}

startBackendServer();
